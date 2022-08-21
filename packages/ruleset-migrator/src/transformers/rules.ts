import { builders as b, namedTypes } from 'ast-types';
import { isPlainObject } from '@stoplight/json';

import type { Hook, Transformer, TransformerCtx } from '../types';
import { isString } from '../utils/guards';
import { raiseError } from '../utils/ast';

export { transformer as default };

function createMissingFunctionError(name: string): namedTypes.CallExpression {
  return raiseError(`Function "${name}" is not defined`);
}

const transformer: Transformer = function (hooks) {
  const store = new WeakMap<TransformerCtx['tree'], unknown>();

  hooks.add(<Hook<{ functions: unknown[] }>>[
    /^$/,
    (input): input is { functions: unknown[] } => isPlainObject(input) && Array.isArray(input.functions),
    (ruleset, ctx): void => {
      store.set(ctx.tree, ruleset.functions);
    },
  ]);

  hooks.add(<Hook<string>>[
    /^\/rules\/[^/]+\/then\/(?:[0-9]+\/)?function$/,
    isString,
    (value, ctx): namedTypes.Identifier | namedTypes.LogicalExpression | namedTypes.CallExpression => {
      const functions = store.get(ctx.tree);

      if (Array.isArray(functions) && functions.includes(value)) {
        const alias = ctx.tree.scope.load(`function-${value}`);
        return alias !== void 0 ? b.identifier(alias) : createMissingFunctionError(value);
      }

      const availableStaticModules = ctx.tree.modules.listStaticModules('function');

      if (availableStaticModules.length === 0) {
        return b.logicalExpression(
          '||',
          ctx.tree.addImport(value, '@stoplight/spectral-functions'),
          createMissingFunctionError(value),
        );
      }

      const resolved = ctx.tree.modules.resolveStaticModule('function', value);
      return resolved === null ? createMissingFunctionError(value) : ctx.tree.addImport(value, resolved);
    },
  ]);
};

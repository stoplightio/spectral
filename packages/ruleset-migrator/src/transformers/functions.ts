import * as path from '@stoplight/path';
import type { Hook, Transformer } from '../types';
import { isPlainObject } from '@stoplight/json';

export { transformer as default };

const transformer: Transformer = function (hooks) {
  hooks.add(<Hook<{ functionsDir?: unknown; functions: unknown[] }>>[
    /^$/,
    (input): input is { functionsDir?: unknown; functions: unknown[] } =>
      isPlainObject(input) && Array.isArray(input.functions),
    (ruleset, ctx): void => {
      const { functionsDir, functions } = ruleset;

      for (const fn of functions) {
        if (typeof fn !== 'string') continue;
        const resolved = ctx.tree.resolveModule(
          path.join('./', typeof functionsDir === 'string' ? functionsDir : 'functions', `./${fn}.js`),
          ctx,
          'function',
        );
        const fnName = path.basename(resolved, true);
        const identifier = ctx.tree.addImport(fnName, resolved, true);
        ctx.tree.scope.store(`function-${fnName}`, identifier.name);
      }
    },
  ]);

  hooks.add([/^\/functions$/, (input): input is { functions: unknown[] } => Array.isArray(input), (): null => null]);
  hooks.add([/^\/functionsDir$/, (input): input is string => typeof input === 'string', (): null => null]);
};

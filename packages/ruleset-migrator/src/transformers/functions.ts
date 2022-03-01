import * as path from '@stoplight/path';
import type { Transformer } from '../types';
import { assertArray, assertString } from '../validation';
import { Ruleset } from '../validation/types';

export { transformer as default };

const transformer: Transformer = function (hooks) {
  hooks.add([
    /^$/,
    (_ruleset, ctx): void => {
      const ruleset = _ruleset as Ruleset;
      const { functionsDir, functions } = ruleset;

      if (Array.isArray(functions) && functions.length > 0) {
        for (const fn of functions) {
          assertString(fn);
          const resolved = ctx.tree.resolveModule(
            path.join('./', typeof functionsDir === 'string' ? functionsDir : 'functions', `./${fn}.js`),
            ctx,
            'function',
          );
          const fnName = path.basename(resolved, true);
          const identifier = ctx.tree.addImport(fnName, resolved, true);
          ctx.tree.scope.store(`function-${fnName}`, identifier.name);
        }
      }
    },
  ]);

  hooks.add([
    /^\/functions$/,
    (value): null => {
      assertArray(value);
      return null;
    },
  ]);

  hooks.add([
    /^\/functionsDir$/,
    (value): null => {
      assertString(value);
      return null;
    },
  ]);
};

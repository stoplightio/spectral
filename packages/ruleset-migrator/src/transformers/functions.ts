import * as path from '@stoplight/path';
import type { Transformer } from '../types';
import { assertArray, assertString } from '../validation';
import { Ruleset } from '../validation/types';

export { transformer as default };

const transformer: Transformer = function (registerHook) {
  registerHook(/^$/, (_ruleset, ctx): void => {
    const ruleset = _ruleset as Ruleset;
    const { functionsDir, functions } = ruleset;

    if (Array.isArray(functions) && functions.length > 0) {
      for (const fn of functions) {
        assertString(fn);
        const resolved = ctx.tree.resolveModule(
          `${fn}.js`,
          path.join(ctx.cwd, typeof functionsDir === 'string' ? functionsDir : 'functions'),
        );
        const fnName = path.basename(resolved, true);
        const identifier = ctx.tree.addImport(fnName, resolved, true);
        ctx.tree.scope.store(`function-${fnName}`, identifier.name);
      }
    }
  });

  registerHook(/^\/functions$/, (value): null => {
    assertArray(value);
    return null;
  });

  registerHook(/^\/functionsDir$/, (value): null => {
    assertString(value);
    return null;
  });
};

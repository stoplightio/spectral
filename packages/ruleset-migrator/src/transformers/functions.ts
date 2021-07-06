import * as path from '@stoplight/path';

import type { Transformer } from '../types';
import { assertArray, assertString } from '../validation';
import { Ruleset } from '../validation/types';

export { transformer as default };

const transformer: Transformer = function (ctx) {
  ctx.hooks.add([
    /^$/,
    (_ruleset): void => {
      const ruleset = _ruleset as Ruleset;
      const { functionsDir, functions } = ruleset;

      if (Array.isArray(functions) && functions.length > 0) {
        ruleset.functions = functions.map(fn => path.join(ctx.cwd, functionsDir ?? 'functions', `${fn}.js`));
        delete ruleset.functionsDir;
      }
    },
  ]);

  ctx.hooks.add([
    /^\/functions$/,
    (value): null => {
      assertArray(value);

      for (const fn of value) {
        assertString(fn);
        ctx.tree.addImport(path.basename(fn, true), fn, true);
      }

      return null;
    },
  ]);
};

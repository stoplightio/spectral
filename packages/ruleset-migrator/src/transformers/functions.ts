import * as path from '@stoplight/path';

import type { Hook, Transformer } from '../types';
import { assertArray, assertString } from '../validation';

export { transformer as default };

const transformer: Transformer = function (ctx) {
  const { functionsDir, functions } = ctx.ruleset;

  if (Array.isArray(functions) && functions.length > 0) {
    ctx.ruleset.functions = functions.map(fn => `./${path.join(functionsDir ?? 'functions', fn)}.js`);
    delete ctx.ruleset.functionsDir;
  }

  const hook: Hook = [
    /^\/functions$/,
    (value): null => {
      assertArray(value);
      ctx.hooks.delete(hook);

      for (const fn of value) {
        assertString(fn);
        ctx.tree.addImport(path.basename(fn, true), fn, true);
      }

      return null;
    },
  ];

  ctx.hooks.add(hook);
};

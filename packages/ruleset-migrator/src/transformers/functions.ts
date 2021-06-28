import * as path from '@stoplight/path';
import { builders as b, namedTypes } from 'ast-types';

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
    (value): namedTypes.ArrayExpression => {
      assertArray(value);
      ctx.hooks.delete(hook);
      delete ctx.ruleset.functions;

      return b.arrayExpression(
        value.map(fn => {
          assertString(fn);
          return ctx.tree.addImport(path.basename(fn, true), fn, true);
        }),
      );
    },
  ];

  ctx.hooks.add(hook);
};

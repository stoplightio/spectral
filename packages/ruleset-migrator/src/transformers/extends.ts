import { builders as b, namedTypes } from 'ast-types';
import * as path from '@stoplight/path';
import { Transformer, TransformerCtx } from '../types';
import { Ruleset } from '../validation/types';
import { assertArray } from '../validation';
import { process } from '..';

const REPLACEMENTS = {
  'spectral:oas': 'oas',
  'spectral:asyncapi': 'asyncapi',
};

const KNOWN_JS_EXTS = /^\.[cm]?js$/;

export { transformer as default };

async function processExtend(
  ctx: TransformerCtx,
  name: string,
): Promise<namedTypes.ObjectExpression | namedTypes.Identifier> {
  if (name in REPLACEMENTS) {
    return ctx.tree.addImport(REPLACEMENTS[name], '@stoplight/spectral-rulesets');
  }

  const filepath = ctx.tree.resolveModule(name);

  if (KNOWN_JS_EXTS.test(path.extname(filepath))) {
    return ctx.tree.addImport('extended_ruleset', filepath, true);
  }

  const existingCwd = ctx.cwd;
  try {
    ctx.cwd = path.dirname(filepath);
    return await process(await ctx.read(filepath, ctx.opts.fs), ctx.hooks);
  } finally {
    ctx.cwd = existingCwd;
  }
}

const transformer: Transformer = function (ctx) {
  ctx.hooks.add([
    /^(\/overrides\/\d+)?\/extends$/,
    async (input): Promise<namedTypes.ArrayExpression | namedTypes.ObjectExpression | namedTypes.Identifier> => {
      const _extends = input as Ruleset['extends'];

      if (typeof _extends === 'string') {
        return processExtend(ctx, _extends);
      }

      assertArray(_extends);

      return b.arrayExpression(
        await Promise.all(
          _extends.map(async ruleset => {
            if (typeof ruleset === 'string') {
              return await processExtend(ctx, ruleset);
            }

            return b.arrayExpression([await processExtend(ctx, ruleset[0]), b.literal(ruleset[1])]);
          }),
        ),
      );
    },
  ]);
};

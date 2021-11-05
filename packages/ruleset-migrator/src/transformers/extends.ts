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

  const existingCwd = ctx.cwd;
  const filepath = ctx.tree.resolveModule(name, existingCwd);

  if (KNOWN_JS_EXTS.test(path.extname(filepath))) {
    return ctx.tree.addImport(`${path.basename(filepath, true)}_${path.extname(filepath)}`, filepath, true);
  }

  const scope = ctx.tree.scope;
  try {
    ctx.cwd = path.dirname(filepath);
    ctx.tree.scope = ctx.tree.scope.fork();
    return await process(await ctx.read(filepath, ctx.opts.fs, ctx.opts.fetch), ctx.hooks);
  } finally {
    ctx.tree.scope = scope;
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
      const extendedRulesets: (namedTypes.ArrayExpression | namedTypes.ObjectExpression | namedTypes.Identifier)[] = [];

      for (const ruleset of _extends) {
        if (typeof ruleset === 'string') {
          extendedRulesets.push(await processExtend(ctx, ruleset));
        } else {
          extendedRulesets.push(b.arrayExpression([await processExtend(ctx, ruleset[0]), b.literal(ruleset[1])]));
        }
      }

      return b.arrayExpression(extendedRulesets);
    },
  ]);
};

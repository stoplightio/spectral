import { builders as b, namedTypes } from 'ast-types';
import * as path from '@stoplight/path';
import { Hook, Transformer, TransformerCtx } from '../types';
import { process } from '..';
import { isString } from '../utils/guards';
import { dumpJson } from '../utils/ast';

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

  const filepath = ctx.tree.resolveModule(name, ctx, 'ruleset');

  if (KNOWN_JS_EXTS.test(path.extname(filepath))) {
    return ctx.tree.addImport(`${path.basename(filepath, true)}_${path.extname(filepath)}`, filepath, true);
  }

  return await process(await ctx.read(filepath, ctx.opts.fs, ctx.opts.fetch), {
    ...ctx,
    filepath,
    tree: ctx.tree.fork(),
  });
}

function isValidArrayExtends(maybeExtends: unknown): maybeExtends is [string, string] {
  return (
    Array.isArray(maybeExtends) &&
    maybeExtends.length === 2 &&
    typeof maybeExtends[0] === 'string' &&
    typeof maybeExtends[1] === 'string'
  );
}

const transformer: Transformer = function (hooks) {
  hooks.add(<Hook<string | unknown[]>>[
    /^(\/overrides\/\d+)?\/extends$/,
    (input): input is string | unknown[] => isString(input) || Array.isArray(input),
    async (
      _extends,
      ctx,
    ): Promise<
      namedTypes.ArrayExpression | namedTypes.ObjectExpression | namedTypes.Literal | namedTypes.Identifier
    > => {
      if (typeof _extends === 'string') {
        return processExtend(ctx, _extends);
      }

      const extendedRulesets: (
        | namedTypes.ArrayExpression
        | namedTypes.ObjectExpression
        | namedTypes.Literal
        | namedTypes.Identifier
      )[] = [];

      for (const ruleset of _extends) {
        if (typeof ruleset === 'string') {
          extendedRulesets.push(await processExtend(ctx, ruleset));
        } else if (isValidArrayExtends(ruleset)) {
          extendedRulesets.push(b.arrayExpression([await processExtend(ctx, ruleset[0]), b.literal(ruleset[1])]));
        } else {
          extendedRulesets.push(dumpJson(ruleset));
        }
      }

      return b.arrayExpression(extendedRulesets);
    },
  ]);
};

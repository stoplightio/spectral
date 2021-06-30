import { Hook, Transformer, TransformerCtx } from '../types';
import { builders as b, namedTypes } from 'ast-types';
import { Ruleset } from '../validation/types';

const REPLACEMENTS = {
  'spectral:oas': 'oas',
  'spectral:asyncapi': 'asyncapi',
};

export { transformer as default };

function processExtend(ctx: TransformerCtx, name: string): namedTypes.AwaitExpression | namedTypes.Identifier {
  if (name in REPLACEMENTS) {
    return ctx.tree.addImport(REPLACEMENTS[name], '@stoplight/spectral-rulesets');
  }

  const migrator = ctx.tree.addImport('migrateRuleset', '@stoplight/spectral-ruleset-migrator');
  return b.awaitExpression(
    b.callExpression(migrator, [
      b.literal(name), // todo: should try to resolve / provide initial options?
    ]),
  );
}

const transformer: Transformer = function (ctx) {
  const hook: Hook = [
    /^(\/overrides\/\d+)?\/extends$/,
    (input): namedTypes.ArrayExpression | namedTypes.AwaitExpression | namedTypes.Identifier => {
      ctx.hooks.delete(hook);
      const _extends = input as Ruleset['extends'];

      if (typeof _extends === 'string') {
        return processExtend(ctx, _extends);
      }

      return b.arrayExpression(
        _extends?.map(ruleset => {
          if (typeof ruleset === 'string') {
            return processExtend(ctx, ruleset);
          }

          return b.arrayExpression([processExtend(ctx, ruleset[0]), b.literal(ruleset[1])]);
        }) ?? [],
      );
    },
  ];

  ctx.hooks.add(hook);
};

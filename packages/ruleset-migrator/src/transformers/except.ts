import type { Transformer } from '../types';
import { Ruleset } from '../validation/types';

export { transformer as default };

const transformer: Transformer = function (ctx) {
  ctx.hooks.add([
    /^$/,
    (_ruleset): void => {
      const ruleset = _ruleset as Ruleset;
      const { except } = ruleset;

      if (except === void 0) return;

      delete ruleset.except;

      const overrides = (ruleset.overrides ??= []) as unknown[];
      overrides.push(
        ...Object.keys(except).map(pattern => ({
          files: [pattern.startsWith('#') ? `**${pattern}` : pattern],
          rules: except[pattern].reduce((rules, rule) => {
            rules[rule] = 'off';
            return rules;
          }, {}),
        })),
      );
    },
  ]);
};

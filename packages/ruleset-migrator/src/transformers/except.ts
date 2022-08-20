import type { Hook, Transformer } from '../types';
import { isPlainObject } from '@stoplight/json';

export { transformer as default };

const transformer: Transformer = function (hooks) {
  hooks.add(<Hook<{ except?: Record<string, unknown>; overrides: unknown }>>[
    /^$/,
    (value: unknown): value is { except?: Record<string, unknown>; overrides: unknown } =>
      isPlainObject(value) && (value.except === void 0 || isPlainObject(value.except)),
    (ruleset): void => {
      const { except } = ruleset;
      if (except === void 0) return;

      delete ruleset.except;

      const overrides = (ruleset.overrides ??= []) as unknown[];

      if (!Array.isArray(overrides)) return;

      overrides.push(
        ...Object.keys(except).map(pattern => {
          const disabledRules = except[pattern];

          return {
            files: [pattern.startsWith('#') ? `**${pattern}` : pattern],
            rules: Array.isArray(disabledRules)
              ? (disabledRules as unknown[]).reduce<Record<string, 'off'>>((rules, rule) => {
                  rules[String(rule)] = 'off';
                  return rules;
                }, {})
              : disabledRules,
          };
        }),
      );
    },
  ]);
};

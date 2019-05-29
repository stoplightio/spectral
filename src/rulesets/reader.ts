import { merge } from 'lodash';
import { RuleCollection } from '../types';
import { IRulesetFile } from '../types/ruleset';
import { formatAjv } from './ajv';
import { validateRuleset } from './validation';

export const rulesetsRegistry = new Map();

export function readRulesFromRulesets(...rulesets: object[]): RuleCollection {
  return rulesets.reduce<RuleCollection>((rules, ruleset) => {
    return merge(rules, readRulesFromRuleset(ruleset));
  }, {});
}

export type Logger = {
  log: (message?: string | undefined, ...args: any[]) => void;
  error: (
    input: string | Error,
    options?:
      | {
          code?: string | undefined;
          exit?: number | undefined;
        }
      | undefined,
  ) => never;
};

export function readRulesFromRuleset(ruleset: object): RuleCollection {
  if (!('rules' in ruleset)) {
    throw new Error('Provided ruleset is not valid');
  }

  const errors = validateRuleset(ruleset as IRulesetFile);

  if (errors.length) {
    throw new Error(`${formatAjv(errors)} Provided ruleset is not valid`);
  }

  const extendz = (ruleset as IRulesetFile).extends;
  const extendedRules = {};
  if (extendz && extendz.length) {
    for (const base of extendz) {
      merge(extendedRules, rulesetsRegistry.get(base).rules);
    }
  }

  return merge(extendedRules, (ruleset as IRulesetFile).rules);
}

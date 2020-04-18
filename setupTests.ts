import { RulesetExceptionCollection } from './src/types/ruleset';

import { Dictionary } from '@stoplight/types';
import { IRunRule, isAsyncApiv2, Rule, Spectral } from './src';
import { rules as asyncApiRules } from './src/rulesets/asyncapi/index.json';

export const buildRulesetExceptionCollectionFrom = (
  loc: string,
  rules: string[] = ['a'],
): RulesetExceptionCollection => {
  const source = {};
  source[loc] = rules;
  return source;
};

const removeAllRulesBut = (spectral: Spectral, ruleName: string) => {
  expect(Object.keys(spectral.rules)).toContain(ruleName);

  const rule1 = spectral.rules[ruleName];

  const rawRule = asyncApiRules[ruleName];

  const patchedRule: Rule = Object.assign(rule1, {
    recommended: true,
    severity: rawRule.severity,
  });

  const rules: Dictionary<Rule, string> = {};
  rules[ruleName] = patchedRule;
  spectral.setRules(rules);
};

export const buildTestSpectralWithAsyncApiRule = async (ruleName: string): Promise<[Spectral, IRunRule]> => {
  const s = new Spectral();
  s.registerFormat('asyncapi2', isAsyncApiv2);
  await s.loadRuleset('spectral:asyncapi');

  removeAllRulesBut(s, ruleName);
  expect(Object.keys(s.rules)).toEqual([ruleName]);

  const rule = s.rules[ruleName];
  expect(rule.recommended).not.toBe(false);
  expect(rule.severity).not.toBeUndefined();
  expect(rule.severity).not.toEqual(-1);
  expect(rule.formats).not.toBeUndefined();
  expect(rule.formats).toContain('asyncapi2');

  return [s, rule];
};

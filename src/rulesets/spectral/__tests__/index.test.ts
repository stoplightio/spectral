import { pick } from 'lodash';
import { spectralRules } from '..';
import { Spectral } from '../../../spectral';
import { enumRuleKey, noUndefRuleKey } from '../schemaToRuleCollection';

describe('Spectral Rules', () => {
  const rules = spectralRules();
  let spectral: Spectral;

  ['given', 'then'].forEach(field => {
    test(`rule is missing '${field}'`, async () => {
      spectral = new Spectral();
      spectral.addRules(pick(rules, noUndefRuleKey(field)));

      const results = await spectral.run({
        rules: {
          'rule-1': {
            [field]: 'value',
          },
          'rule-2': {
            // field is missing
          },
        },
      });
      expect(results).toMatchSnapshot();
    });
  });

  ['severity', 'type'].forEach(field => {
    test(`has valid value '${field}'`, async () => {
      spectral = new Spectral();
      const ruleKey = enumRuleKey(field);
      const ruleset = pick(rules, ruleKey);
      const validValues = (ruleset[ruleKey].then as any).functionOptions.values;
      spectral.addRules(ruleset);

      const results = await spectral.run({
        rules: {
          'rule-1': {
            [field]: validValues[0],
          },
        },
      });

      expect(results).toEqual([]);
    });

    test(`has invalid value '${field}'`, async () => {
      spectral = new Spectral();
      const ruleKey = enumRuleKey(field);
      const ruleset = pick(rules, ruleKey);
      spectral.addRules(ruleset);

      const results = await spectral.run({
        rules: {
          'rule-1': {
            [field]: 'some weird value xyz random stuff',
          },
        },
      });

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchSnapshot();
    });

    test(`has no value '${field}'`, async () => {
      spectral = new Spectral();
      const ruleKey = enumRuleKey(field);
      const ruleset = pick(rules, ruleKey);
      spectral.addRules(ruleset);

      const results = await spectral.run({
        rules: {
          'rule-1': {},
        },
      });

      expect(results).toEqual([]);
    });
  });
});

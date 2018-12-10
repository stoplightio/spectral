import { ValidationSeverity } from '@stoplight/types';
const merge = require('lodash/merge');

import { Spectral } from '../spectral';
import { RuleFunction } from '../types';

describe('spectral', () => {
  describe('addRules & mergeRules', () => {
    test('should not mutate the passing in rules object', () => {
      const givenCustomRuleSet = {
        rule1: {
          summary: '',
          given: '$',
          then: {
            function: RuleFunction.TRUTHY,
          },
        },
      };

      // deep copy
      const expectedCustomRuleSet = merge({}, givenCustomRuleSet);

      const s = new Spectral();
      s.addRules(givenCustomRuleSet);

      s.mergeRules({
        rule1: {
          severity: ValidationSeverity.Error,
        },
      });

      expect(expectedCustomRuleSet).toEqual(givenCustomRuleSet);
    });

    test('should update/append on the current rules', () => {
      const s = new Spectral();

      s.addRules({
        rule1: {
          summary: '',
          given: '$',
          severity: ValidationSeverity.Warn,
          then: {
            function: RuleFunction.TRUTHY,
          },
        },
      });

      s.mergeRules({
        rule2: {
          summary: '',
          given: '$',
          then: {
            function: RuleFunction.TRUTHY,
          },
        },
      });

      expect(Object.keys(s.rules)).toEqual(['rule1', 'rule2']);

      s.mergeRules({
        rule1: {
          severity: ValidationSeverity.Error,
        },
      });

      expect(Object.keys(s.rules)).toEqual(['rule1', 'rule2']);
      expect(s.rules.rule1.severity).toBe(ValidationSeverity.Error);
    });
  });

  describe('addRuleDeclarations', () => {
    describe('boolean value', () => {
      test('should update the name rule enabled property', () => {
        const s = new Spectral();

        s.addRules({
          rule1: {
            summary: '',
            given: '$',
            enabled: false,
            then: {
              function: RuleFunction.TRUTHY,
            },
          },
        });

        s.applyRuleDeclrations({
          rule1: true,
        });

        expect(Object.keys(s.rules)).toEqual(['rule1']);
        expect(s.rules.rule1.enabled).toBe(true);
      });
    });
  });
});

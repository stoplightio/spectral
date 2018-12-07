const merge = require('lodash/merge');

import { Spectral } from '../spectral';
import { RuleFunction } from '../types';

describe('spectral', () => {
  test('adding/merging rules should not mutate the passing in rules object', () => {
    const givenCustomRuleSet = {
      rule1: {
        summary: '',
        given: '$',
        then: {
          function: RuleFunction.TRUTHY,
          functionOptions: {
            properties: 'something',
          },
        },
      },
    };

    // deep copy
    const expectedCustomRuleSet = merge({}, givenCustomRuleSet);

    const s = new Spectral();
    s.addRules(givenCustomRuleSet);

    s.mergeRules({
      rule1: false,
    });

    expect(expectedCustomRuleSet).toEqual(givenCustomRuleSet);
  });

  test('mergeRules should update/append on the current rules', () => {
    const s = new Spectral();

    s.addRules({
      rule1: {
        summary: '',
        given: '$',
        then: {
          function: RuleFunction.TRUTHY,
          functionOptions: {
            properties: 'something',
          },
        },
      },
    });

    s.mergeRules({
      rule2: {
        summary: '',
        given: '$',
        then: {
          function: RuleFunction.TRUTHY,
          functionOptions: {
            properties: 'a different rule',
          },
        },
      },
    });

    expect(Object.keys(s.rules)).toEqual(['rule1', 'rule2']);

    s.mergeRules({
      rule1: false,
    });

    expect(Object.keys(s.rules)).toEqual(['rule1', 'rule2']);
    expect(s.rules.rule1.enabled).toBe(false);
  });
});

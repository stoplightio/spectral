const merge = require('lodash/merge');
import { ValidationSeverity } from '@stoplight/types/validations';

import { Spectral } from '../index';
import { defaultRuleset } from '../rulesets';
import { IRuleset, RuleFunction, RuleType } from '../types';

const todosPartialDeref = require('./fixtures/todos.partial-deref.oas2.json');

describe('spectral', () => {
  test('load and run the default rule set', () => {
    const s = new Spectral({
      rulesets: [defaultRuleset()],
    });

    const results = s.run({ target: todosPartialDeref, spec: 'oas2' });
    expect(results.length).toBeGreaterThan(0);
  });

  // Assures: https://stoplightio.atlassian.net/browse/SL-786
  test('setting/updating rules should not mutate the original ruleset', () => {
    const givenCustomRuleSet = {
      rules: {
        oas2: {
          rule1: {
            type: RuleType.STYLE,
            function: RuleFunction.TRUTHY,
            path: '$',
            enabled: true,
            summary: '',
            input: {
              properties: 'something',
            },
          },
        },
      },
    };
    // deep copy
    const expectedCustomRuleSet = merge({}, givenCustomRuleSet);

    const s = new Spectral({ rulesets: [givenCustomRuleSet] });

    s.updateRules([
      {
        rules: {
          oas2: {
            rule1: false,
          },
        },
      },
    ]);

    expect(expectedCustomRuleSet).toEqual(givenCustomRuleSet);
  });

  // Assures: https://stoplightio.atlassian.net/browse/SL-789
  test('setRules should overwrite the current ruleset', () => {
    const ruleset = {
      rules: {
        format: {
          rule1: {
            type: RuleType.STYLE,
            function: RuleFunction.TRUTHY,
            path: '$',
            enabled: true,
            summary: '',
            input: {
              properties: 'something',
            },
          },
        },
      },
    };
    // deep copy
    const s = new Spectral({ rulesets: [ruleset] });

    s.setRules([
      {
        rules: {
          differentFormat: {
            rule2: {
              type: RuleType.STYLE,
              function: RuleFunction.TRUTHY,
              path: '$',
              enabled: true,
              summary: '',
              input: {
                properties: 'a different rule',
              },
            },
          },
        },
      },
    ]);

    expect(s.getRules()).toHaveLength(1);
    expect(s.getRules()).toMatchInlineSnapshot(`
Array [
  Object {
    "apply": [Function],
    "format": "differentFormat",
    "name": "rule2",
    "rule": Object {
      "enabled": true,
      "function": "truthy",
      "input": Object {
        "properties": "a different rule",
      },
      "path": "$",
      "summary": "",
      "type": "style",
    },
  },
]
`);
  });

  // Assures: https://stoplightio.atlassian.net/browse/SL-789
  test('updateRules should update/append the current ruleset', () => {
    const ruleset = {
      rules: {
        format: {
          rule1: {
            type: RuleType.STYLE,
            function: RuleFunction.TRUTHY,
            path: '$',
            enabled: true,
            summary: '',
            input: {
              properties: 'something',
            },
          },
        },
      },
    };
    // deep copy
    const s = new Spectral({ rulesets: [ruleset] });

    s.updateRules([
      {
        rules: {
          differentFormat: {
            rule2: {
              type: RuleType.STYLE,
              function: RuleFunction.TRUTHY,
              path: '$',
              enabled: true,
              summary: '',
              input: {
                properties: 'a different rule',
              },
            },
          },
        },
      },
    ]);

    expect(s.getRules()).toHaveLength(2);

    s.updateRules([
      {
        rules: {
          format: {
            rule1: false,
          },
        },
      },
    ]);

    expect(s.getRules()).toHaveLength(2);
  });

  // Assures: https://stoplightio.atlassian.net/browse/SL-787
  test('given a ruleset with two identical rules under two distinct formats should not collide', () => {
    const rulesets = [
      {
        rules: {
          oas2: {
            ruleName1: {
              type: RuleType.STYLE,
              function: RuleFunction.TRUTHY,
              path: '$',
              enabled: true,
              summary: '',
              input: {
                properties: 'something-different',
              },
            },
          },
          oas3: {
            ruleName1: {
              type: RuleType.STYLE,
              function: RuleFunction.NOT_CONTAIN,
              path: '$.license',
              enabled: false,
              summary: '',
              input: {
                properties: ['url'],
                value: 'gruntjs',
              },
            },
          },
        },
      },
    ];

    const s = new Spectral({ rulesets });

    expect(s.getRules('oas2')).toMatchInlineSnapshot(`
Array [
  Object {
    "apply": [Function],
    "format": "oas2",
    "name": "ruleName1",
    "rule": Object {
      "enabled": true,
      "function": "truthy",
      "input": Object {
        "properties": "something-different",
      },
      "path": "$",
      "summary": "",
      "type": "style",
    },
  },
]
`);
    expect(s.getRules('oas3')).toMatchInlineSnapshot(`
Array [
  Object {
    "apply": [Function],
    "format": "oas3",
    "name": "ruleName1",
    "rule": Object {
      "enabled": false,
      "function": "notContain",
      "input": Object {
        "properties": Array [
          "url",
        ],
        "value": "gruntjs",
      },
      "path": "$.license",
      "summary": "",
      "type": "style",
    },
  },
]
`);
  });

  test('be able to toggle rules on apply', () => {
    const spec = {
      hello: 'world',
    };

    const rulesets: IRuleset[] = [
      {
        rules: {
          oas2: {
            'lint:test': {
              type: RuleType.STYLE,
              function: RuleFunction.TRUTHY,
              path: '$',
              enabled: false,
              severity: ValidationSeverity.Error,
              description: 'this should return an error if enabled',
              summary: '',
              input: {
                properties: 'nonexistant-property',
              },
            },
          },
        },
      },
    ];

    const overrideRulesets: IRuleset[] = [
      {
        rules: {
          oas2: {
            'lint:test': true,
          },
        },
      },
    ];

    const s = new Spectral({ rulesets });

    // run once with no override config
    let results = s.run({ target: spec, spec: 'oas2' });
    expect(results.length).toEqual(0);

    // run again with an override config
    results = s.run({ target: spec, spec: 'oas2', rulesets: overrideRulesets });
    expect(results.length).toEqual(1);
  });

  // Assures: https://stoplightio.atlassian.net/browse/SL-788
  test('run with rulesets overrides ruleset on run, not permenantly', () => {
    const spec = {
      hello: 'world',
    };

    const rulesets: IRuleset[] = [
      {
        rules: {
          format: {
            test: {
              type: RuleType.STYLE,
              function: RuleFunction.TRUTHY,
              path: '$',
              enabled: false,
              severity: ValidationSeverity.Error,
              summary: '',
              input: {
                properties: 'nonexistant-property',
              },
            },
          },
        },
      },
    ];

    const overrideRulesets: IRuleset[] = [
      {
        rules: {
          format: {
            test: true,
          },
        },
      },
    ];

    const s = new Spectral({ rulesets });

    const originalRules = s.getRules('format');

    s.run({ target: spec, spec: 'format', rulesets: overrideRulesets });

    expect(s.getRules('format')).toEqual(originalRules);
  });

  test('getRules returns a flattened list of rules filtered by format', () => {
    const rulesets: IRuleset[] = [
      {
        rules: {
          oas2: {
            rule1: {
              type: RuleType.STYLE,
              function: RuleFunction.TRUTHY,
              path: '$',
              enabled: false,
              summary: '',
              input: {
                properties: 'something-not-present',
              },
            },
          },
          oas3: {
            rule3: {
              type: RuleType.STYLE,
              function: RuleFunction.TRUTHY,
              path: '$',
              enabled: false,
              summary: '',
              input: {
                properties: 'something-not-present',
              },
            },
          },
        },
      },
    ];

    const s = new Spectral({ rulesets });
    const results = s.getRules('oas2');

    expect(results.length).toBe(1);
  });
});

import { Spectral } from '../index';
import { allPreset } from '../rulesets';
import { IRuleset } from '../types';

const todosPartialDeref = require('./fixtures/todos.partial-deref.oas2.json');

describe('spectral', () => {
  test('load and run the default rule set', () => {
    const s = new Spectral({
      rulesets: [allPreset()],
    });

    const results = s.run({ target: todosPartialDeref, spec: 'oas2' });
    expect(results.length).toBeGreaterThan(0);
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
              type: 'style',
              function: 'truthy',
              path: '$',
              enabled: false,
              severity: 'error',
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

  test('getRules returns a flattened list of rules filtered by format', () => {
    const rulesets: IRuleset[] = [
      {
        rules: {
          oas2: {
            rule1: {
              type: 'style',
              function: 'truthy',
              path: '$',
              enabled: false,
              summary: '',
              input: {
                properties: 'something-not-present',
              },
            },
          },
          'oas2|oas3': {
            rule2: {
              type: 'style',
              function: 'truthy',
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
              type: 'style',
              function: 'truthy',
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

    expect(results.length).toBe(2);
  });
});

import { Spectral } from '../index';
import { IRuleConfig } from '../types';

const spec = require('./fixtures/todos.partial-deref.oas2.json');

describe('spectral', () => {
  test('load and run the default rule set', () => {
    const s = new Spectral();
    const results = s.apply(spec, 'oas2');
    expect(results.length).toBeGreaterThan(0);
  });

  test('be able to toggle rules on apply', () => {
    const spec = {
      something: 'something-else',
    };

    const initialConfig: IRuleConfig = {
      rules: {
        oas2: {
          'lint:test': {
            category: 'style',
            type: 'truthy',
            path: '$',
            enabled: false,
            description: 'this should return a result if enabled',
            summary: '',
            truthy: 'something-not-present',
          },
        },
      },
    };

    const overrideConfig: IRuleConfig = {
      rules: {
        oas2: {
          'lint:test': true,
        },
      },
    };

    const s = new Spectral(initialConfig);
    // run once with no override config
    let results = s.apply(spec, 'oas2');
    expect(results.length).toEqual(0);

    // run again with an override config
    results = s.apply(spec, 'oas2', overrideConfig);
    expect(results.length).toEqual(1);
  });
});

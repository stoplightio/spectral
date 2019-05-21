import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('operation-tags', () => {
  const s = new Spectral();
  s.addRules({
    'operation-tags': Object.assign(ruleset.rules['operation-tags'], {
      enabled: true,
      type: RuleType[ruleset.rules['operation-tags'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            tags: [{ name: 'todos' }],
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if tags is missing', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {},
        },
      },
    });
    expect(results).toMatchSnapshot();
  });
});

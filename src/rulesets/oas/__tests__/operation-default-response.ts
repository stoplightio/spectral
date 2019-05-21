import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('operation-default-response', () => {
  const s = new Spectral();
  s.addRules({
    'operation-default-response': Object.assign(ruleset.rules['operation-default-response'], {
      enabled: true,
      type: RuleType[ruleset.rules['operation-default-response'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/path': {
          '/get': {
            responses: {
              default: {},
            },
          },
        },
      },
    });
    expect(results).toHaveLength(0);
  });

  test('return errors if path-responses is missing default', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/path': {
          '/get': {
            responses: {
              '2xx': {},
            },
          },
        },
      },
    });
    expect(results).toMatchSnapshot();
  });
});

import { Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('operation-operationId-valid-in-url', () => {
  const s = new Spectral();
  s.addRules({
    // @ts-ignore
    'operation-operationId-valid-in-url': Object.assign(ruleset.rules['operation-operationId-valid-in-url'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            operationId: "A-Za-z0-9-._~:/?#[]@!$&'()*+,;=",
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if operationId contains invalid characters', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            operationId: 'foo-^^',
          },
        },
      },
    });
    expect(results).toMatchSnapshot();
  });
});

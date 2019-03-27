import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };
const operationPath = "$..paths.*[?( name() !== 'parameters' )]";

describe('operation-2xx-response', () => {
  const s = new Spectral();
  s.addRules({
    'operation-2xx-response': Object.assign(ruleset.rules['operation-2xx-response'], {
      given: operationPath,
      enabled: true,
    }),
  });

  test('is happy when a 2xx response is set', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/path': {
          get: {
            responses: {
              '204': {},
            },
          },
        },
      },
    });
    expect(results).toHaveLength(0);
  });

  test('warns about missing 2xx response', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/path': {
          get: {
            responses: {
              400: {},
            },
          },
        },
      },
    });
    expect(results).toMatchInlineSnapshot('sd');
  });

  test('can handle vendor extensions in the path', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/path': {
          'x-summary': 'why is this here',
          get: {
            responses: {
              '204': {},
            },
          },
        },
      },
    });
    expect(results).toMatchInlineSnapshot('sd');
  });
});

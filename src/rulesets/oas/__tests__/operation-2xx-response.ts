import { commonOasFunctions, commonOasRules } from '../';
import { Spectral } from '../../../spectral';

const rules = commonOasRules();
const { oasOp2xxResponse } = commonOasFunctions();

describe('operation-2xx-response', () => {
  let spectral: Spectral;

  beforeEach(() => {
    spectral = new Spectral();
    spectral.addFunctions({ oasOp2xxResponse });
    spectral.addRules({
      'operation-2xx-response': rules['operation-2xx-response'],
    });
  });

  test('is happy when a 2xx response is set', async () => {
    const results = await spectral.run({
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
    const results = await spectral.run({
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

    expect(results).toEqual([
      expect.objectContaining({
        code: 'operation-2xx-response',
        message: 'operations must define at least one 2xx response',
        path: ['paths', '/path', 'get', 'responses'],
      }),
    ]);
  });

  test('can handle vendor extensions in the path', async () => {
    const results = await spectral.run({
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

    expect(results).toEqual([
      expect.objectContaining({
        code: 'operation-2xx-response',
        message: 'operations must define at least one 2xx response',
        path: ['paths', '/path', 'get', 'responses'],
      }),
    ]);
  });
});

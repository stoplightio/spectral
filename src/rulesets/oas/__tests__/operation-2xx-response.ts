import { commonOasFunctions } from '../';
import { Spectral } from '../../../spectral';
import { rules } from '../ruleset.json';

const { oasOp2xxResponse } = commonOasFunctions();

describe('operation-2xx-response', () => {
  let spectral: Spectral;

  beforeEach(() => {
    spectral = new Spectral();
    spectral.addFunctions({ oasOp2xxResponse });
    spectral.addRules({
      // @ts-ignore
      'operation-2xx-response': rules['operation-2xx-response'],
    });
  });

  test('is happy when a 200 response is set', async () => {
    const results = await spectral.run({
      swagger: '2.0',
      paths: {
        '/path': {
          get: {
            responses: {
              '200': {},
            },
          },
        },
      },
    });

    expect(results).toHaveLength(0);
  });

  test('is happy when a (non 200) 2xx response is set', async () => {
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

  ['put', 'post', 'delete', 'options', 'head', 'patch', 'trace'].forEach(method => {
    test(`warns if HTTP verb ${method} is missing a 2xx response`, async () => {
      const obj = {
        swagger: '2.0',
        paths: {
          '/path': {},
        },
      };
      obj.paths['/path'][method] = {
        responses: {
          '418': {},
        },
      };
      const results = await spectral.run(obj);
      expect(results).toEqual([
        expect.objectContaining({
          code: 'operation-2xx-response',
          message: 'Operation must have at least one `2xx` response.',
          path: ['paths', '/path', method, 'responses'],
        }),
      ]);
    });
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
        summary: 'Operation must have at least one `2xx` response.',
        path: ['paths', '/path', 'get', 'responses'],
      }),
    ]);
  });

  test('ignores anything at the PathItem level which is not a HTTP method', async () => {
    const results = await spectral.run({
      swagger: '2.0',
      paths: {
        '/path': {
          'x-summary': 'why is this here',
        },
      },
    });
    expect(results).toEqual([]);
  });
});

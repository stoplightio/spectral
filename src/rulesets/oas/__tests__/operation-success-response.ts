import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('operation-success-response', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['operation-success-response']);
  });

  test('is happy when a 200 response is set', async () => {
    const results = await s.run({
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

  test('is happy when a 301 response is set', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/path': {
          get: {
            responses: {
              '301': {},
            },
          },
        },
      },
    });

    expect(results).toHaveLength(0);
  });

  test('is happy when a (non 200) success response is set', async () => {
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

  test.each(['put', 'post', 'delete', 'options', 'head', 'patch', 'trace'])(
    'warns if HTTP verb %s is missing a success response',
    async method => {
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
      const results = await s.run(obj);
      expect(results).toEqual([
        expect.objectContaining({
          code: 'operation-success-response',
          message: 'Operation must have at least one `2xx` or `3xx` response.',
          path: ['paths', '/path', method, 'responses'],
        }),
      ]);
    },
  );

  test('warns about missing success response', async () => {
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

    expect(results).toEqual([
      expect.objectContaining({
        code: 'operation-success-response',
        message: 'Operation must have at least one `2xx` or `3xx` response.',
        path: ['paths', '/path', 'get', 'responses'],
      }),
    ]);
  });

  test('ignores anything at the PathItem level which is not a HTTP method', async () => {
    const results = await s.run({
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

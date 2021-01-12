import type { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';

describe('oas2-anyOf', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await loadRules(['oas2-anyOf']);
  });

  test('annotates with correct paths', async () => {
    const results = await s.run({
      swagger: '2.0',
      schemes: ['http'],
      info: {
        title: 'Test',
        version: '1.0.0',
      },
      paths: {
        '/test': {
          get: {
            responses: {
              200: {
                description: 'A paged array of pets',
                schema: {
                  anyOf: [{ type: 'string' }, { type: null }],
                },
              },
            },
          },
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'oas2-anyOf',
        message: 'anyOf is not available in OpenAPI v2, it was added in OpenAPI v3',
        path: ['paths', '/test', 'get', 'responses', '200', 'schema', 'anyOf'],
        range: {
          end: {
            character: 30,
            line: 21,
          },
          start: {
            character: 22,
            line: 16,
          },
        },
        severity: 1,
        source: undefined,
      },
    ]);
  });
});

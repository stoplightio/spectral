import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('oas2-oneOf', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['oas2-oneOf']);
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
                  oneOf: [{ type: 'string' }, { type: 'null' }],
                },
              },
            },
          },
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'oas2-oneOf',
        message: 'oneOf is not available in OpenAPI v2, it was added in OpenAPI v3',
        path: ['paths', '/test', 'get', 'responses', '200', 'schema', 'oneOf'],
        range: {
          end: {
            character: 32,
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

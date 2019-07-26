import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('oas2-oneOf', () => {
  const s = new Spectral();
  s.addRules({
    'oas2-oneOf': Object.assign(ruleset.rules['oas2-oneOf'], {
      recommended: true,
      type: RuleType[ruleset.rules['oas2-oneOf'].type],
    }),
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
                  oneOf: [{ type: 'string' }, { type: null }],
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

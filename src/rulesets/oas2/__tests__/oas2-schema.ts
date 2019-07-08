import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('oas2-schema', () => {
  const s = new Spectral();
  s.addRules({
    'oas2-schema': Object.assign(ruleset.rules['oas2-schema'], {
      recommended: true,
      type: RuleType[ruleset.rules['oas2-schema'].type],
    }),
  });

  test('annotates with correct paths', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/test': {
          get: {},
        },
      },
      schemes: ['http'],
      info: {
        title: 'Test',
        version: '1.0.0',
      },
    });
    expect(results).toEqual([
      {
        code: 'oas2-schema',
        message: "/paths//test/get should have required property 'responses'",
        path: ['paths', '~1test', 'get'],
        range: {
          end: {
            character: 15,
            line: 4,
          },
          start: {
            character: 10,
            line: 2,
          },
        },
        severity: 0,
      },
    ]);
  });
});

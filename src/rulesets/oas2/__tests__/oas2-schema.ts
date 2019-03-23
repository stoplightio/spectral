import { Spectral } from '../../../spectral';
import { oas2Rules } from '../index';

const ruleset = { rules: oas2Rules() };

describe('oas2-schema', () => {
  const s = new Spectral();
  s.addRules({
    'oas2-schema': Object.assign(ruleset.rules['oas2-schema'], {
      enabled: true,
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
    expect(results).toHaveLength(1);
    expect(results[0].path).toEqual(['paths', '/test', 'get']);
  });
});

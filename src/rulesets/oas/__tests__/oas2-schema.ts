import { Spectral } from '../../../spectral';

import { createWithRules } from './__helpers__/createWithRules';

describe('oas2-schema', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['oas2-schema']);
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
        message: `\`get\` property must have required property \`responses\`.`,
        path: ['paths', '/test', 'get'],
        range: {
          end: {
            character: 15,
            line: 4,
          },
          start: {
            character: 12,
            line: 4,
          },
        },
        severity: 0,
      },
    ]);
  });
});

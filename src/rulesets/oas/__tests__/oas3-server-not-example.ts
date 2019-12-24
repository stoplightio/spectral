import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('oas3-server-not-example.com', () => {
  const s = new Spectral();
  s.registerFormat('oas3', () => true);
  s.setRules({
    'oas3-server-not-example.com': Object.assign(ruleset.rules['oas3-server-not-example.com'], {
      recommended: true,
      type: RuleType[ruleset.rules['oas3-server-not-example.com'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
      servers: [
        {
          url: 'https://stoplight.io',
        },
      ],
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if server is example.com', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
      servers: [
        {
          url: 'https://example.com',
        },
      ],
    });
    expect(results).toEqual([
      expect.objectContaining({
        code: 'oas3-server-not-example.com',
        message: 'Server URL should not point at example.com.',
        path: ['servers', '0', 'url'],
      }),
    ]);
  });
});

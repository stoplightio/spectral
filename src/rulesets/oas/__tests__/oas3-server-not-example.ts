import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('oas3-server-not-example.com', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['oas3-server-not-example.com']);
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
    expect([...results]).toEqual([
      expect.objectContaining({
        code: 'oas3-server-not-example.com',
        message: 'Server URL should not point at example.com.',
        path: ['servers', '0', 'url'],
      }),
    ]);
  });
});

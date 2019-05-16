import { Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('server-not-example.com', () => {
  const s = new Spectral();
  s.addRules({
    // @ts-ignore
    'server-not-example.com': Object.assign(ruleset.rules['server-not-example.com'], {
      enabled: true,
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
    expect(results).toMatchSnapshot();
  });
});

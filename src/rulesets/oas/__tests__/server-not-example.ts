import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('server-not-example.com', () => {
  const s = new Spectral();
  s.addRules({
    'server-not-example.com': Object.assign(ruleset.rules['server-not-example.com'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
      servers: [
        {
          url: 'https://stoplight.io',
        },
      ],
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if server is example.com', () => {
    const results = s.run({
      servers: [
        {
          url: 'https://example.com',
        },
      ],
    });
    expect(results.results.length).toEqual(1);
  });
});

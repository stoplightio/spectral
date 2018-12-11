import { Spectral } from '../../../spectral';
import { oas3Rules } from '../index';

const ruleset = { rules: oas3Rules() };

describe('server-trailing-slash', () => {
  const s = new Spectral();
  s.addRules({
    'server-trailing-slash': Object.assign(ruleset.rules['server-trailing-slash'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
      openapi: '3.0.0',
      paths: {},
      servers: [
        {
          url: 'https://stoplight.io',
        },
      ],
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if server url ends with a slash', () => {
    const results = s.run({
      openapi: '3.0.0',
      paths: {},
      servers: [
        {
          url: 'https://stoplight.io/',
        },
      ],
    });
    expect(results.results).toMatchSnapshot();
  });
});

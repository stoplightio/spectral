import { Spectral } from '../../..';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('server-trailing-slash', () => {
  const s = new Spectral();
  s.addRules({
    'server-trailing-slash': Object.assign(ruleset.rules['server-trailing-slash'], {
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

  test('return errors if server url ends with a slash', () => {
    const results = s.run({
      servers: [
        {
          url: 'https://stoplight.io/',
        },
      ],
    });
    expect(results.results.length).toEqual(1);
  });
});

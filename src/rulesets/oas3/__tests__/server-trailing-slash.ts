import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('server-trailing-slash', () => {
  const s = new Spectral();
  s.addRules({
    'server-trailing-slash': Object.assign(ruleset.rules['server-trailing-slash'], {
      recommended: true,
      type: RuleType[ruleset.rules['server-trailing-slash'].type],
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

  test('return errors if server url ends with a slash', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      paths: {},
      servers: [
        {
          url: 'https://stoplight.io/',
        },
      ],
    });
    expect(results).toMatchSnapshot();
  });
});

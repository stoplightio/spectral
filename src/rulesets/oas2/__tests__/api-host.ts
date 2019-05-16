import { Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('api-host', () => {
  const s = new Spectral();
  s.addRules({
    // @ts-ignore
    'api-host': Object.assign(ruleset.rules['api-host'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      host: 'stoplight.io',
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if missing host', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
    });

    expect(results).toMatchSnapshot();
  });
});

import { Spectral } from '../../../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('api-host', () => {
  const s = new Spectral();
  s.addRules({
    'api-host': Object.assign(ruleset.rules['api-host'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {},
      host: 'stoplight.io',
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if missing host', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {},
    });
    expect(results.results.length).toEqual(1);
  });
});

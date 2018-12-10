import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('api-schemes', () => {
  const s = new Spectral();
  s.addRules({
    'api-schemes': Object.assign(ruleset.rules['api-schemes'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {},
      schemes: ['http'],
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if schemes is missing ', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {},
    });
    expect(results.results.length).toEqual(1);
  });

  test('return errors if schemes is an empty array ', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {},
      schemes: [],
    });
    expect(results.results.length).toEqual(1);
  });
});

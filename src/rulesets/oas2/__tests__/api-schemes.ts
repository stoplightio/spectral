import { Spectral } from '../../../spectral';
import { oas2Rules } from '../index';

const ruleset = { rules: oas2Rules() };

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
    expect(results.results).toMatchSnapshot();
  });

  test('return errors if schemes is an empty array ', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {},
      schemes: [],
    });
    expect(results.results).toMatchSnapshot();
  });
});

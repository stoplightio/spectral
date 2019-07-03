import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('api-schemes', () => {
  const s = new Spectral();
  s.addRules({
    'api-schemes': Object.assign(ruleset.rules['api-schemes'], {
      recommended: true,
      type: RuleType[ruleset.rules['api-schemes'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      schemes: ['http'],
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if schemes is missing ', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
    });
    expect(results).toMatchSnapshot();
  });

  test('return errors if schemes is an empty array ', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      schemes: [],
    });
    expect(results).toMatchSnapshot();
  });
});

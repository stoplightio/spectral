import { Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('api-schemes', () => {
  const s = new Spectral();
  s.addRules({
    // @ts-ignore
    'api-schemes': Object.assign(ruleset.rules['api-schemes'], {
      enabled: true,
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

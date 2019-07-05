import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('api-host', () => {
  const s = new Spectral();
  s.addRules({
    'api-host': Object.assign(ruleset.rules['api-host'], {
      recommended: true,
      type: RuleType[ruleset.rules['api-host'].type],
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

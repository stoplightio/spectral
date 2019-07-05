import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../rules.json';

describe('license-url', () => {
  const s = new Spectral();
  s.addRules({
    'license-url': Object.assign(ruleset.rules['license-url'], {
      recommended: true,
      type: RuleType[ruleset.rules['license-url'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        license: { url: 'stoplight.io' },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if info license is missing url', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        license: { name: 'MIT' },
      },
    });
    expect(results).toMatchSnapshot();
  });
});

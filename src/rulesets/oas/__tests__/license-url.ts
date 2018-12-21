import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('license-url', () => {
  const s = new Spectral();
  s.addRules({
    'license-url': Object.assign(ruleset.rules['license-url'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {},
      info: {
        license: { url: 'stoplight.io' },
      },
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if info license is missing url', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {},
      info: {
        license: { name: 'MIT' },
      },
    });
    expect(results.results).toMatchSnapshot();
  });
});

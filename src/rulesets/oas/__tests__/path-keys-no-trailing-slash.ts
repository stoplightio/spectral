import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('path-keys-no-trailing-slash', () => {
  const s = new Spectral();
  s.addRules({
    'path-keys-no-trailing-slash': Object.assign(ruleset.rules['path-keys-no-trailing-slash'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
      swagger: '2.0',
      paths: { '/path': {} },
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if path ends with a slash', () => {
    const results = s.run({
      swagger: '2.0',
      paths: { '/path/': {} },
    });
    expect(results.results).toMatchSnapshot();
  });

  test('does not return error if path IS a /', () => {
    const results = s.run({
      swagger: '2.0',
      paths: { '/': {} },
    });
    expect(results.results.length).toEqual(0);
  });
});

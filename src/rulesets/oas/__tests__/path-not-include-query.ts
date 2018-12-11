import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('path-not-include-query', () => {
  const s = new Spectral();
  s.addRules({
    'path-not-include-query': Object.assign(ruleset.rules['path-not-include-query'], {
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

  test('return errors if indlues a query', () => {
    const results = s.run({
      swagger: '2.0',
      paths: { '/path?query=true': {} },
    });
    expect(results.results).toMatchSnapshot();
  });
});

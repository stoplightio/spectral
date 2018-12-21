import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('tag-description', () => {
  const s = new Spectral();
  s.addRules({
    'tag-description': Object.assign(ruleset.rules['tag-description'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'tag', description: 'some-description' }],
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if tag has no description', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'tag' }],
    });
    expect(results.results).toMatchSnapshot();
  });
});

import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('openapi-tags', () => {
  const s = new Spectral();
  s.addRules({
    'openapi-tags': Object.assign(ruleset.rules['openapi-tags'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'todos' }],
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if missing tags', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
    });
    expect(results.results).toMatchSnapshot();
  });
});

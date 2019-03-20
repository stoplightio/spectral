import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('openapi-tags-alphabetical', () => {
  const s = new Spectral();
  s.addRules({
    'openapi-tags-alphabetical': Object.assign(ruleset.rules['openapi-tags-alphabetical'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'a-tag' }, { name: 'b-tag' }],
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if tags is not in alphabetical order', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'b-tag' }, { name: 'a-tag' }],
    });
    expect(results).toMatchSnapshot();
  });
});

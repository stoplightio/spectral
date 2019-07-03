import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('openapi-tags', () => {
  const s = new Spectral();
  s.addRules({
    'openapi-tags': Object.assign(ruleset.rules['openapi-tags'], {
      recommended: true,
      type: RuleType[ruleset.rules['openapi-tags'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'todos' }],
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if missing tags', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
    });
    expect(results).toMatchSnapshot();
  });
});

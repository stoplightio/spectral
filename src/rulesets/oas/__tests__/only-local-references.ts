import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('only-local-references', () => {
  const s = new Spectral();
  s.addRules({
    'only-local-references': Object.assign(ruleset.rules['only-local-references'], {
      enabled: true,
      type: RuleType[ruleset.rules['only-local-references'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      parameters: [{ $ref: '#/reference/path' }],
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if not local ref', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      parameters: [{ $ref: 'https://stoplight.io#/reference/path' }],
    });
    expect(results).toMatchSnapshot();
  });
});

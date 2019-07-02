import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('path-keys-no-trailing-slash', () => {
  const s = new Spectral();
  s.addRules({
    'path-keys-no-trailing-slash': Object.assign(ruleset.rules['path-keys-no-trailing-slash'], {
      enabled: true,
      type: RuleType[ruleset.rules['path-keys-no-trailing-slash'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: { '/path': {} },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if path ends with a slash', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: { '/path/': {} },
    });
    expect(results).toMatchSnapshot();
  });

  test('does not return error if path IS a /', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: { '/': {} },
    });
    expect(results.length).toEqual(0);
  });
});

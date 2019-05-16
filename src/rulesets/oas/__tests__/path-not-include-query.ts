import { Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('path-not-include-query', () => {
  const s = new Spectral();
  s.addRules({
    // @ts-ignore
    'path-not-include-query': Object.assign(ruleset.rules['path-not-include-query'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: { '/path': {} },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if includes a query', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: { '/path?query=true': {} },
    });
    expect(results).toMatchSnapshot();
  });
});

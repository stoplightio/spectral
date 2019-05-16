import { Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('info-contact', () => {
  const s = new Spectral();
  s.addRules({
    // @ts-ignore
    'info-contact': Object.assign(ruleset.rules['info-contact'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: { version: '1.0', contact: {} },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if info is missing contact', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: { version: '1.0' },
    });
    expect(results).toMatchSnapshot();
  });
});

import { Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('info-license', () => {
  const s = new Spectral();
  s.addRules({
    // @ts-ignore
    'info-license': Object.assign(ruleset.rules['info-license'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        contact: { name: 'stoplight.io' },
        license: { name: 'MIT' },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if info missing license', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        contact: { name: 'stoplight.io' },
      },
    });
    expect(results).toMatchSnapshot();
  });
});

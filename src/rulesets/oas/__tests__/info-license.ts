import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('info-license', () => {
  const s = new Spectral();
  s.addRules({
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
    expect(results.results.length).toEqual(0);
  });

  test('return errors if info missing license', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        contact: { name: 'stoplight.io' },
      },
    });
    expect(results.results).toMatchSnapshot();
  });
});

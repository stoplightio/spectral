import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('info-description', () => {
  const s = new Spectral();
  s.addRules({
    'info-description': Object.assign(ruleset.rules['info-description'], {
      enabled: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: { contact: { name: 'stoplight.io' }, description: 'description' },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if info missing description', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: { contact: { name: 'stoplight.io' } },
    });
    expect(results).toMatchSnapshot();
  });
});

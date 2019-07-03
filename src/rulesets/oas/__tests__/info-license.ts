import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../ruleset.json';

describe('info-license', () => {
  const s = new Spectral();
  s.addRules({
    'info-license': Object.assign(ruleset.rules['info-license'], {
      recommended: true,
      type: RuleType[ruleset.rules['info-license'].type],
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

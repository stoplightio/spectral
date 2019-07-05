import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../rules.json';

describe('contact-properties', () => {
  const s = new Spectral();
  s.addRules({
    'contact-properties': Object.assign(ruleset.rules['contact-properties'], {
      recommended: true,
      type: RuleType[ruleset.rules['contact-properties'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        contact: {
          name: 'stoplight',
          url: 'stoplight.io',
          email: 'support@stoplight.io',
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if name, url, email are missing', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: { contact: {} },
    });
    expect(results).toMatchSnapshot();
  });
});

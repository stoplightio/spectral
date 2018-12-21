import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('contact-properties', () => {
  const s = new Spectral();
  s.addRules({
    'contact-properties': Object.assign(ruleset.rules['contact-properties'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
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
    expect(results.results.length).toEqual(0);
  });

  test('return errors if name, url, email are missing', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {},
      info: { contact: {} },
    });
    expect(results.results).toMatchSnapshot();
  });
});

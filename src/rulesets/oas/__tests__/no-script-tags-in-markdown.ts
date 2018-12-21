import { Spectral } from '../../../spectral';
import { commonOasRules } from '../index';

const ruleset = { rules: commonOasRules() };

describe('no-script-tags-in-markdown', () => {
  const s = new Spectral();
  s.addRules({
    'no-script-tags-in-markdown': Object.assign(ruleset.rules['no-script-tags-in-markdown'], {
      enabled: true,
    }),
  });

  test('validate a correct object', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {},
      info: {
        description: 'some description text',
      },
    });
    expect(results.results.length).toEqual(0);
  });

  test('return errors if descriptions include <script', () => {
    const results = s.run({
      swagger: '2.0',
      paths: {},
      info: {
        description: 'some description contains <script',
      },
    });
    expect(results.results).toMatchSnapshot();
  });
});

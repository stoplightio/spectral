import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('no-script-tags-in-markdown', () => {
  const s = new Spectral();
  s.addRules({
    'no-script-tags-in-markdown': Object.assign(ruleset.rules['no-script-tags-in-markdown'], {
      recommended: true,
      type: RuleType[ruleset.rules['no-script-tags-in-markdown'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        description: 'some description text',
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if descriptions include <script', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        description: 'some description contains <script',
      },
    });
    expect(results).toMatchSnapshot();
  });
});

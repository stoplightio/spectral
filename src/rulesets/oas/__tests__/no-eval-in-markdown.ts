import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('no-eval-in-markdown', () => {
  const s = new Spectral();
  s.addRules({
    'no-eval-in-markdown': Object.assign(ruleset.rules['no-eval-in-markdown'], {
      recommended: true,
      type: RuleType[ruleset.rules['no-eval-in-markdown'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        title: 'some title text',
        description: 'some description text',
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if descriptions or titles include eval', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        title: 'some title contains eval(',
        description: 'some description contains eval(',
      },
    });
    expect(results).toMatchSnapshot();
  });
});

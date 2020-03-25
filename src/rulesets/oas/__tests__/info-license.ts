import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('info-license', () => {
  const s = new Spectral();
  s.setRules({
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
    expect(results).toEqual([
      {
        code: 'info-license',
        message: 'OpenAPI object `info` should contain a `license` object.',
        path: ['info'],
        range: {
          end: {
            character: 28,
            line: 5,
          },
          start: {
            character: 9,
            line: 3,
          },
        },
        severity: 1,
      },
    ]);
  });
});

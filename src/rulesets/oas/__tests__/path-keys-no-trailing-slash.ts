import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('path-keys-no-trailing-slash', () => {
  const s = new Spectral();
  s.addRules({
    'path-keys-no-trailing-slash': Object.assign(ruleset.rules['path-keys-no-trailing-slash'], {
      recommended: true,
      type: RuleType[ruleset.rules['path-keys-no-trailing-slash'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: { '/path': {} },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if path ends with a slash', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: { '/path/': {} },
    });
    expect(results).toEqual([
      {
        code: 'path-keys-no-trailing-slash',
        message: 'given keys should not end with a slash.',
        path: ['paths', '/path/'],
        range: {
          end: {
            character: 16,
            line: 3,
          },
          start: {
            character: 13,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('does not return error if path IS a /', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: { '/': {} },
    });
    expect(results.length).toEqual(0);
  });
});

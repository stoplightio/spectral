import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('path-declarations-must-exist', () => {
  const s = new Spectral();
  s.addRules({
    'path-declarations-must-exist': Object.assign(ruleset.rules['path-declarations-must-exist'], {
      recommended: true,
      type: RuleType[ruleset.rules['path-declarations-must-exist'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: { '/path/{parameter}': {} },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if parameter is empty', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: { '/path/{}': {} },
    });
    expect(results).toEqual([
      {
        code: 'path-declarations-must-exist',
        message: 'given declarations cannot be empty, ex.`/given/{}` is invalid.',
        path: ['paths', '/path/{}'],
        range: {
          end: {
            character: 18,
            line: 3,
          },
          start: {
            character: 15,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
        summary: 'given declarations cannot be empty, ex.`/given/{}` is invalid.',
      },
    ]);
  });
});

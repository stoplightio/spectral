import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';

describe('path-declarations-must-exist', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await loadRules(['path-declarations-must-exist']);
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
        message: 'Path parameter declarations cannot be empty, ex.`/given/{}` is invalid.',
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
      },
    ]);
  });
});

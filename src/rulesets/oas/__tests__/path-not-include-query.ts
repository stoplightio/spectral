import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('path-not-include-query', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['path-not-include-query']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: { '/path': {} },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if includes a query', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: { '/path?query=true': {} },
    });
    expect([...results]).toEqual([
      {
        code: 'path-not-include-query',
        message: 'given keys should not include a query string.',
        path: ['paths', '/path?query=true'],
        range: {
          end: {
            character: 26,
            line: 3,
          },
          start: {
            character: 23,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});

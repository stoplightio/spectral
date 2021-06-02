import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('path-keys-no-trailing-slash', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['path-keys-no-trailing-slash']);
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
    expect([...results]).toEqual([
      {
        code: 'path-keys-no-trailing-slash',
        message: 'paths should not end with a slash.',
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

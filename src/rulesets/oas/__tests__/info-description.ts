import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('info-description', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['info-description']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: { contact: { name: 'stoplight.io' }, description: 'description' },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if info missing description', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: { contact: { name: 'stoplight.io' } },
    });
    expect(results).toEqual([
      {
        code: 'info-description',
        message: 'OpenAPI object info `description` must be present and non-empty string.',
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
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});

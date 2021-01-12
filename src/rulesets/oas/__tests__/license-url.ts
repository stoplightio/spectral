import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';

describe('license-url', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await loadRules(['license-url']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        license: { url: 'stoplight.io' },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if info license is missing url', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      info: {
        license: { name: 'MIT' },
      },
    });
    expect(results).toEqual([
      {
        code: 'license-url',
        message: 'License object should include `url`.',
        path: ['info', 'license'],
        range: {
          end: {
            character: 19,
            line: 5,
          },
          start: {
            character: 14,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});

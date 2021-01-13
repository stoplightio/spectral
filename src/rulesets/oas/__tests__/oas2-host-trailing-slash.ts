import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('oas2-host-trailing-slash', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['oas2-host-trailing-slash']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      host: 'stoplight.io',
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if host url ends with a slash', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      host: 'stoplight.io/',
    });
    expect(results).toEqual([
      {
        code: 'oas2-host-trailing-slash',
        message: 'Server URL should not have a trailing slash.',
        path: ['host'],
        range: {
          end: {
            character: 25,
            line: 3,
          },
          start: {
            character: 10,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});

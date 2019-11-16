import { DiagnosticSeverity } from '@stoplight/types';
import { Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('oas2-api-host', () => {
  const s = new Spectral();
  s.registerFormat('oas2', () => true);
  s.setRules({
    'oas2-api-host': Object.assign(ruleset.rules['oas2-api-host'], {
      recommended: true,
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      host: 'stoplight.io',
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if missing host', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
    });

    expect(results).toEqual([
      {
        code: 'oas2-api-host',
        message: 'OpenAPI `host` must be present and non-empty string.',
        path: [],
        range: {
          end: {
            character: 13,
            line: 2,
          },
          start: {
            character: 0,
            line: 0,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});

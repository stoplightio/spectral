import { DiagnosticSeverity } from '@stoplight/types';
import { Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('oas2-host-trailing-slash', () => {
  const s = new Spectral();
  s.registerFormat('oas2', () => true);
  s.setRules({
    'oas2-host-trailing-slash': Object.assign(ruleset.rules['oas2-host-trailing-slash'], {
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

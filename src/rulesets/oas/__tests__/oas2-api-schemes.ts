import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('oas2-api-schemes', () => {
  const s = new Spectral();
  s.registerFormat('oas2', () => true);
  s.setRules({
    'oas2-api-schemes': Object.assign(ruleset.rules['oas2-api-schemes'], {
      recommended: true,
      type: RuleType[ruleset.rules['oas2-api-schemes'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      schemes: ['http'],
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if schemes is missing', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
    });
    expect(results).toEqual([
      {
        code: 'oas2-api-schemes',
        message: 'OpenAPI host `schemes` must be present and non-empty array.',
        path: [],
        resolvedPath: ['schemes'],
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

  test('return errors if schemes is an empty array', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      schemes: [],
    });
    expect(results).toEqual([
      {
        code: 'oas2-api-schemes',
        message: 'OpenAPI host `schemes` must be present and non-empty array.',
        path: ['schemes'],
        resolvedPath: ['schemes'],
        range: {
          end: {
            character: 15,
            line: 3,
          },
          start: {
            character: 12,
            line: 3,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});

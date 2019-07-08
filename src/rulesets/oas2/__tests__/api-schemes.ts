import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('api-schemes', () => {
  const s = new Spectral();
  s.addRules({
    'api-schemes': Object.assign(ruleset.rules['api-schemes'], {
      recommended: true,
      type: RuleType[ruleset.rules['api-schemes'].type],
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
        code: 'api-schemes',
        message: 'OpenAPI host `schemes` must be present and non-empty array.',
        path: ['schemes'],
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
        code: 'api-schemes',
        message: 'OpenAPI host `schemes` must be present and non-empty array.',
        path: ['schemes'],
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

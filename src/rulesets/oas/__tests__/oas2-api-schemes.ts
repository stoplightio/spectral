import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('oas2-api-schemes', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['oas2-api-schemes']);
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
    expect([...results]).toEqual([
      {
        code: 'oas2-api-schemes',
        message: 'OpenAPI host `schemes` must be present and non-empty array.',
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

  test('return errors if schemes is an empty array', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {},
      schemes: [],
    });
    expect([...results]).toEqual([
      {
        code: 'oas2-api-schemes',
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

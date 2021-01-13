import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('operation-description', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['operation-description']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            description: 'some-description',
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if operation description is missing', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {},
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'operation-description',
        message: 'Operation `description` must be present and non-empty string.',
        path: ['paths', '/todos', 'get'],
        range: {
          end: {
            character: 15,
            line: 4,
          },
          start: {
            character: 12,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('does not get called on parameters', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          parameters: [],
        },
      },
    });
    expect(results).toEqual([]);
  });
});

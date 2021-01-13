import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('operation-operationId', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['operation-operationId']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            operationId: 'some-id',
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if operation id is missing', async () => {
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
        code: 'operation-operationId',
        message: 'Operation should have an `operationId`.',
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

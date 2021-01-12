import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { loadRules } from './__helpers__/loadRules';

describe('operation-operationId-valid-in-url', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await loadRules(['operation-operationId-valid-in-url']);
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            operationId: "A-Za-z0-9-._~:/?#[]@!$&'()*+,;=",
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if operationId contains invalid characters', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            operationId: 'foo-^^',
          },
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'operation-operationId-valid-in-url',
        message: 'operationId may only use characters that are valid when used in a URL.',
        path: ['paths', '/todos', 'get', 'operationId'],
        range: {
          end: {
            character: 31,
            line: 5,
          },
          start: {
            character: 23,
            line: 5,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });
});

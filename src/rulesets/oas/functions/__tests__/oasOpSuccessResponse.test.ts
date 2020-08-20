import { DiagnosticSeverity } from '@stoplight/types/dist';
import { RuleType, Spectral } from '../../../../spectral';
import { rules } from '../../index.json';
import oasOpSuccessResponse from '../oasOpSuccessResponse';

describe('oasOpSuccessResponse', () => {
  let s: Spectral;

  beforeEach(() => {
    s = new Spectral();
    s.setFunctions({ oasOpSuccessResponse });
    s.setRules({
      'operation-success-response': Object.assign(rules['operation-success-response'], {
        recommended: true,
        type: RuleType[rules['operation-success-response'].type],
      }),
    });
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      paths: {
        '/path1': {
          get: {
            responses: {
              '200': {
                description: '',
                schema: {
                  type: 'object',
                  properties: {},
                },
              },
            },
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors if missing Success', async () => {
    const results = await s.run({
      paths: {
        '/path1': {
          get: {
            responses: {
              '400': {
                description: '',
                schema: {
                  type: 'object',
                  properties: {},
                },
              },
            },
          },
        },
      },
    });

    expect(results).toEqual([
      {
        code: 'operation-success-response',
        message: 'Operation must have at least one `2xx` or `3xx` response.',
        path: ['paths', '/path1', 'get', 'responses'],
        range: {
          end: {
            character: 30,
            line: 9,
          },
          start: {
            character: 20,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('return errors if no responses', async () => {
    const results = await s.run({
      paths: {
        '/path1': {
          get: {
            responses: {},
          },
        },
      },
    });
    expect(results).toEqual([
      {
        code: 'operation-success-response',
        message: 'Operation must have at least one `2xx` or `3xx` response.',
        path: ['paths', '/path1', 'get', 'responses'],
        range: {
          end: {
            character: 23,
            line: 4,
          },
          start: {
            character: 20,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Warning,
      },
    ]);
  });

  test('does not complain when no $.responses property', async () => {
    const results = await s.run({
      paths: {
        '/test': {
          get: {
            operationId: '123',
          },
          post: {
            operationId: '123',
          },
        },
      },
    });
    expect(results).toEqual([]);
  });
});

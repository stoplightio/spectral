import { DiagnosticSeverity } from '@stoplight/types/dist';
import { RuleType, Spectral } from '../../../../spectral';
import { rules } from '../../index.json';
import oasOp2xxResponse from '../oasOp2xxResponse';

describe('oasOp2xxResponse', () => {
  const s = new Spectral();
  s.registerFormat('oas2', () => true);
  s.setFunctions({ oasOp2xxResponse });
  s.setRules({
    'operation-2xx-response': Object.assign(rules['operation-2xx-response'], {
      recommended: true,
      type: RuleType[rules['operation-2xx-response'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      swagger: '2.0',
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

  test('return errors if missing 2xx', async () => {
    const results = await s.run({
      swagger: '2.0',
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
      expect.objectContaining({
        code: 'operation-2xx-response',
        message: 'Operation must have at least one `2xx` response.',
        path: ['paths', '/path1', 'get', 'responses'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });

  test('return errors if no responses', async () => {
    const results = await s.run({
      swagger: '2.0',
      paths: {
        '/path1': {
          get: {
            responses: {},
          },
        },
      },
    });
    expect(results).toEqual([
      expect.objectContaining({
        code: 'operation-2xx-response',
        message: 'Operation must have at least one `2xx` response.',
        path: ['paths', '/path1', 'get', 'responses'],
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
  });

  test('does not complain when no $.responses property', async () => {
    const results = await s.run({
      swagger: '2.0',
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

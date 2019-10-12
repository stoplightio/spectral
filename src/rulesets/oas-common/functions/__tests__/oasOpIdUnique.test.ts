import { RuleType, Spectral } from '../../../../index';

import { DiagnosticSeverity } from '@stoplight/types';
import { rules } from '../../index.json';
import oasOpIdUnique from '../oasOpIdUnique';

describe('oasOpIdUnique', () => {
  const s = new Spectral();

  s.setFunctions({ oasOpIdUnique });
  s.setRules({
    'operation-operationId-unique': Object.assign(rules['operation-operationId-unique'], {
      recommended: true,
      type: RuleType[rules['operation-operationId-unique'].type],
    }),
  });

  test('validate a correct object', async () => {
    const results = await s.run({
      paths: {
        '/path1': {
          get: {
            operationId: 'id1',
          },
        },
        '/path2': {
          get: {
            operationId: 'id2',
          },
        },
      },
    });
    expect(results.length).toEqual(0);
  });

  test('return errors on different path operations same id', async () => {
    const results = await s.run({
      paths: {
        '/path1': {
          get: {
            operationId: 'id1',
          },
        },
        '/path2': {
          get: {
            operationId: 'id1',
          },
        },
      },
    });

    expect(results).toEqual([
      {
        code: 'operation-operationId-unique',
        message: 'Every operation must have a unique `operationId`.',
        path: ['paths', '/path1', 'get', 'operationId'],
        range: {
          end: {
            character: 28,
            line: 4,
          },
          start: {
            character: 23,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'operation-operationId-unique',
        message: 'Every operation must have a unique `operationId`.',
        path: ['paths', '/path2', 'get', 'operationId'],
        range: {
          end: {
            character: 28,
            line: 9,
          },
          start: {
            character: 23,
            line: 9,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
    ]);
  });

  test('return errors on same path operations same id', async () => {
    const results = await s.run({
      paths: {
        '/path1': {
          get: {
            operationId: 'id1',
          },
          post: {
            operationId: 'id1',
          },
        },
      },
    });

    expect(results).toEqual([
      {
        code: 'operation-operationId-unique',
        message: 'Every operation must have a unique `operationId`.',
        path: ['paths', '/path1', 'get', 'operationId'],
        range: {
          end: {
            character: 28,
            line: 4,
          },
          start: {
            character: 23,
            line: 4,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'operation-operationId-unique',
        message: 'Every operation must have a unique `operationId`.',
        path: ['paths', '/path1', 'post', 'operationId'],
        range: {
          end: {
            character: 28,
            line: 7,
          },
          start: {
            character: 23,
            line: 7,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
    ]);
  });
});

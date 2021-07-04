import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('operation-operationId', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            operationId: 'some-id',
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'operation id is missing',
    document: {
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'operation-operationId',
        message: 'Operation must have "operationId".',
        path: ['paths', '/todos', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'does not get called on parameters',
    document: {
      swagger: '2.0',
      paths: {
        '/todos': {
          parameters: [],
        },
      },
    },
    errors: [],
  },
]);

import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('operation-operationId-valid-in-url', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            operationId: "A-Za-z0-9-._~:/?#[]@!$&'()*+,;=",
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'operationId contains invalid characters',
    document: {
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            operationId: 'foo-^^',
          },
        },
      },
    },
    errors: [
      {
        message: 'operationId may only use characters that are valid when used in a URL.',
        path: ['paths', '/todos', 'get', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

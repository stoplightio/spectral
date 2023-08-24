import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('operation-description', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            description: 'some-description',
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'operation description is missing',
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
        message: 'Operation "description" must be present and non-empty string.',
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

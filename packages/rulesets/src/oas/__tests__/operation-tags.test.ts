import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('operation-tags', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: {
        '/todos': {
          get: {
            tags: [{ name: 'todos' }],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'tags is missing',

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
        code: 'operation-tags',
        message: 'Operation should have non-empty `tags` array.',
        path: ['paths', '/todos', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

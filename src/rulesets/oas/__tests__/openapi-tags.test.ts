import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('openapi-tags', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: {},
      tags: [{ name: 'todos' }],
    },
    errors: [],
  },

  {
    name: 'missing tags',
    document: {
      swagger: '2.0',
      paths: {},
    },
    errors: [
      {
        message: 'OpenAPI object should have non-empty `tags` array.',
        path: [],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'empty tags',
    document: {
      swagger: '2.0',
      paths: {},
      tags: [],
    },
    errors: [
      {
        message: 'OpenAPI object should have non-empty `tags` array.',
        path: ['tags'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

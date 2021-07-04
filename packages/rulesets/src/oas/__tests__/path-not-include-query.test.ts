import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('path-not-include-query', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: { '/path': {} },
    },
    errors: [],
  },

  {
    name: 'includes a query',
    document: {
      swagger: '2.0',
      paths: { '/path?query=true': {} },
    },
    errors: [
      {
        message: 'Path must not include query string.',
        path: ['paths', '/path?query=true'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

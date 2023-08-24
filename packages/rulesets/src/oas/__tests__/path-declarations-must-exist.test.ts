import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('path-declarations-must-exist', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: { '/path/{parameter}': {} },
    },
    errors: [],
  },

  {
    name: 'parameter is empty',
    document: {
      swagger: '2.0',
      paths: { '/path/{}': {} },
    },
    errors: [
      {
        code: 'path-declarations-must-exist',
        message: 'Path parameter declarations must not be empty, ex."/given/{}" is invalid.',
        path: ['paths', '/path/{}'],

        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

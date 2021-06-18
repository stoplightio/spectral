import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('path-keys-no-trailing-slash', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: { '/path': {} },
    },
    errors: [],
  },

  {
    name: 'path ends with a slash',
    document: {
      swagger: '2.0',
      paths: { '/path/': {} },
    },
    errors: [
      {
        message: 'paths should not end with a slash.',
        path: ['paths', '/path/'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'does not return error if path IS a /',
    document: {
      swagger: '2.0',
      paths: { '/': {} },
    },
    errors: [],
  },
]);

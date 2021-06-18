import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas2-host-trailing-slash', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: {},
      host: 'stoplight.io',
    },
    errors: [],
  },

  {
    name: 'host url ends with a slash',
    document: {
      swagger: '2.0',
      paths: {},
      host: 'stoplight.io/',
    },
    errors: [
      {
        message: 'Server URL should not have a trailing slash.',
        path: ['host'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

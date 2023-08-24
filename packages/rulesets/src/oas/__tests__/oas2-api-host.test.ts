import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas2-api-host', [
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
    name: 'missing host',
    document: {
      swagger: '2.0',
      paths: {},
    },
    errors: [
      {
        code: 'oas2-api-host',
        message: 'OpenAPI "host" must be present and non-empty string.',
        path: [],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

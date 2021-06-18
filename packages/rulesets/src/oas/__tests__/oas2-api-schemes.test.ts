import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas2-api-schemes', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      paths: {},
      schemes: ['http'],
    },
    errors: [],
  },

  {
    name: 'schemes is missing',
    document: {
      swagger: '2.0',
      paths: {},
    },
    errors: [
      {
        message: 'OpenAPI host `schemes` must be present and non-empty array.',
        path: [],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'schemes is an empty array',
    document: {
      swagger: '2.0',
      paths: {},
      schemes: [],
    },
    errors: [
      {
        message: 'OpenAPI host `schemes` must be present and non-empty array.',
        path: ['schemes'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

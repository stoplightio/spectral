import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas3-api-servers', [
  {
    name: 'valid case',
    document: {
      openapi: '3.0.0',
      paths: {},
      servers: [{ url: 'https://stoplight.io' }],
    },
    errors: [],
  },

  {
    name: 'servers is missing',
    document: {
      openapi: '3.0.0',
      paths: {},
    },
    errors: [
      {
        message: 'OpenAPI "servers" must be present and non-empty array.',
        path: [],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'servers is an empty array',
    document: {
      openapi: '3.0.0',
      paths: {},
      servers: [],
    },
    errors: [
      {
        code: 'oas3-api-servers',
        message: 'OpenAPI "servers" must be present and non-empty array.',
        path: ['servers'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

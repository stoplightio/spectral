import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas3-server-not-example.com', [
  {
    name: 'valid case',
    document: {
      openapi: '3.0.0',
      paths: {},
      servers: [
        {
          url: 'https://stoplight.io',
        },
      ],
    },
    errors: [],
  },

  {
    name: 'server is example.com',
    document: {
      openapi: '3.0.0',
      paths: {},
      servers: [
        {
          url: 'https://example.com',
        },
      ],
    },
    errors: [
      {
        message: 'Server URL must not point at example.com.',
        path: ['servers', '0', 'url'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

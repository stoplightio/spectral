import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-3-server-no-trailing-slash', [
  {
    name: 'valid',
    document: {
      asyncapi: '3.0.0',
      servers: {
        production: {
          host: 'stoplight.io',
          protocol: 'https',
        },
      },
    },
    errors: [],
  },

  {
    name: '{server}.host property ends with a trailing slash',
    document: {
      asyncapi: '3.0.0',
      servers: {
        production: {
          host: 'stoplight.io/',
          protocol: 'https',
        },
      },
    },
    errors: [
      {
        message: 'Server host must not end with slash.',
        path: ['servers', 'production', 'host'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

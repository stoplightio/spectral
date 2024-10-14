import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-3-server-not-example-com', [
  {
    name: 'valid case',
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
    name: '{server}.host property is set to `example.com`',
    document: {
      asyncapi: '3.0.0',
      servers: {
        production: {
          host: 'example.com',
          protocol: 'https',
        },
      },
    },
    errors: [
      {
        message: 'Server host must not point at example.com.',
        path: ['servers', 'production', 'host'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

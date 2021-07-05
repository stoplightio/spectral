import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-server-not-example-com', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          url: 'stoplight.io',
          protocol: 'https',
        },
      },
    },
    errors: [],
  },

  {
    name: '{server}.url property is set to `example.com`',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          url: 'example.com',
          protocol: 'https',
        },
      },
    },
    errors: [
      {
        message: 'Server URL must not point at example.com.',
        path: ['servers', 'production', 'url'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

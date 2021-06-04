import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('asyncapi-server-no-trailing-slash', [
  {
    name: 'valid',
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
    name: '{server}.url property ends with a trailing slash',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          url: 'stoplight.io/',
          protocol: 'https',
        },
      },
    },
    errors: [
      {
        message: 'Server URL should not end with a slash.',
        path: ['servers', 'production', 'url'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-server-no-empty-variable', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          url: '{sub}.stoplight.io',
          protocol: 'https',
        },
      },
    },
    errors: [],
  },
  {
    name: '{server}.url property contains empty variable substitution pattern',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          url: '{}.stoplight.io',
          protocol: 'https',
        },
      },
    },
    errors: [
      {
        message: 'Server URL must not have empty variable substitution pattern.',
        path: ['servers', 'production', 'url'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

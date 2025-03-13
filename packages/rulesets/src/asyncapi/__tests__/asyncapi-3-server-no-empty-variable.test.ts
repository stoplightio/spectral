import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-3-server-no-empty-variable', [
  {
    name: 'valid case',
    document: {
      asyncapi: '3.0.0',
      servers: {
        production: {
          host: '{sub}.stoplight.io',
          protocol: 'https',
        },
      },
    },
    errors: [],
  },
  {
    name: '{server}.url property contains empty variable substitution pattern',
    document: {
      asyncapi: '3.0.0',
      servers: {
        production: {
          host: '{}.stoplight.io',
          protocol: 'https',
        },
      },
    },
    errors: [
      {
        message: 'Server host and pathname must not have empty variable substitution pattern.',
        path: ['servers', 'production', 'host'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

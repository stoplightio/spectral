import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-servers', [
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
    name: 'servers property is missing',
    document: {
      asyncapi: '2.0.0',
    },
    errors: [
      {
        message: 'AsyncAPI object should contain a non empty `servers` object.',
        path: [],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'servers property is empty',
    document: {
      asyncapi: '2.0.0',
      servers: {},
    },
    errors: [
      {
        message: 'AsyncAPI object should contain a non empty `servers` object.',
        path: ['servers'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

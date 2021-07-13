import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas3-server-trailing-slash', [
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
    name: 'object with default value',
    document: {
      openapi: '3.0.0',
      paths: {},
      servers: [
        {
          url: '/',
        },
      ],
    },
    errors: [],
  },

  {
    name: 'server url ends with a slash',
    document: {
      openapi: '3.0.0',
      paths: {},
      servers: [
        {
          url: 'https://stoplight.io/',
        },
      ],
    },
    errors: [
      {
        message: 'Server URL must not have trailing slash.',
        path: ['servers', '0', 'url'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

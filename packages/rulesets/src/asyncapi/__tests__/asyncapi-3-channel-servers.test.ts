import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-3-channel-servers', [
  {
    name: 'valid case',
    document: {
      asyncapi: '3.0.0',
      servers: {
        development: {},
        production: {},
      },
      channels: {
        channel: {
          servers: [{ $ref: '#/servers/development' }],
        },
      },
    },
    errors: [],
  },

  {
    name: 'valid case - without defined servers',
    document: {
      asyncapi: '3.0.0',
      servers: {
        development: {},
        production: {},
      },
      channels: {
        channel: {},
      },
    },
    errors: [],
  },

  {
    name: 'valid case - without defined servers in the root',
    document: {
      asyncapi: '3.0.0',
      channels: {
        channel: {},
      },
    },
    errors: [],
  },

  {
    name: 'valid case - without defined channels in the root',
    document: {
      asyncapi: '3.0.0',
      servers: {
        development: {},
        production: {},
      },
    },
    errors: [],
  },

  {
    name: 'valid case - with empty array',
    document: {
      asyncapi: '3.0.0',
      servers: {
        development: {},
        production: {},
      },
      channels: {
        channel: {
          servers: [],
        },
      },
    },
    errors: [],
  },

  {
    name: 'invalid case - without defined servers',
    document: {
      asyncapi: '3.0.0',
      channels: {
        channel: {
          servers: [{ $ref: '#/another-server' }],
        },
      },
    },
    errors: [
      {
        message: 'Channel servers must be defined in the "servers" object.',
        path: ['channels', 'channel', 'servers', '0', '$ref'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid case - with defined servers but incorrect reference',
    document: {
      asyncapi: '3.0.0',
      servers: {
        development: {},
        production: {},
      },
      channels: {
        channel: {
          servers: [{ $ref: '#/development' }],
        },
      },
    },
    errors: [
      {
        message: 'Channel servers must be defined in the "servers" object.',
        path: ['channels', 'channel', 'servers', '0', '$ref'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);

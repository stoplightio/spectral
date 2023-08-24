import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-channel-servers', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.2.0',
      servers: {
        development: {},
        production: {},
      },
      channels: {
        channel: {
          servers: ['development'],
        },
      },
    },
    errors: [],
  },

  {
    name: 'valid case - without defined servers',
    document: {
      asyncapi: '2.2.0',
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
      asyncapi: '2.2.0',
      channels: {
        channel: {},
      },
    },
    errors: [],
  },

  {
    name: 'valid case - without defined channels in the root',
    document: {
      asyncapi: '2.2.0',
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
      asyncapi: '2.2.0',
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
    name: 'invalid case',
    document: {
      asyncapi: '2.2.0',
      servers: {
        development: {},
        production: {},
      },
      channels: {
        channel: {
          servers: ['another-server'],
        },
      },
    },
    errors: [
      {
        message: 'Channel contains server that are not defined on the "servers" object.',
        path: ['channels', 'channel', 'servers', '0'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'invalid case - one server is defined, another one not',
    document: {
      asyncapi: '2.2.0',
      servers: {
        development: {},
        production: {},
      },
      channels: {
        channel: {
          servers: ['production', 'another-server'],
        },
      },
    },
    errors: [
      {
        message: 'Channel contains server that are not defined on the "servers" object.',
        path: ['channels', 'channel', 'servers', '1'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'invalid case - without defined servers',
    document: {
      asyncapi: '2.2.0',
      channels: {
        channel: {
          servers: ['production'],
        },
      },
    },
    errors: [
      {
        message: 'Channel contains server that are not defined on the "servers" object.',
        path: ['channels', 'channel', 'servers', '0'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);

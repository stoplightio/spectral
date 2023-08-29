import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-server-variables', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          url: '{sub}.stoplight.io',
          protocol: 'https',
          variables: {
            sub: {},
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'server has not defined definition for one of the url variables',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          url: '{sub}.{anotherParam}.stoplight.io',
          protocol: 'https',
          variables: {
            sub: {},
          },
        },
      },
    },
    errors: [
      {
        message: 'Not all server\'s variables are described with "variables" object. Missed: anotherParam.',
        path: ['servers', 'production', 'variables'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'server has not defined definition for two of the url variables',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          url: '{sub}.{anotherParam1}.{anotherParam2}.stoplight.io',
          protocol: 'https',
          variables: {
            sub: {},
          },
        },
      },
    },
    errors: [
      {
        message:
          'Not all server\'s variables are described with "variables" object. Missed: anotherParam1, anotherParam2.',
        path: ['servers', 'production', 'variables'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'server has not defined definition for one of the url variables (in the components.servers)',
    document: {
      asyncapi: '2.3.0',
      components: {
        servers: {
          production: {
            url: '{sub}.{anotherParam}.stoplight.io',
            protocol: 'https',
            variables: {
              sub: {},
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Not all server\'s variables are described with "variables" object. Missed: anotherParam.',
        path: ['components', 'servers', 'production', 'variables'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'server has unused url variables',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          url: '{sub}.stoplight.io',
          protocol: 'https',
          variables: {
            sub: {},
            anotherParam1: {},
            anotherParam2: {},
          },
        },
      },
    },
    errors: [
      {
        message: 'Server\'s "variables" object has unused defined "anotherParam1" url variable.',
        path: ['servers', 'production', 'variables', 'anotherParam1'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Server\'s "variables" object has unused defined "anotherParam2" url variable.',
        path: ['servers', 'production', 'variables', 'anotherParam2'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'server has unused url variables (in the components.servers)',
    document: {
      asyncapi: '2.3.0',
      components: {
        servers: {
          production: {
            url: '{sub}.stoplight.io',
            protocol: 'https',
            variables: {
              sub: {},
              anotherParam1: {},
              anotherParam2: {},
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Server\'s "variables" object has unused defined "anotherParam1" url variable.',
        path: ['components', 'servers', 'production', 'variables', 'anotherParam1'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Server\'s "variables" object has unused defined "anotherParam2" url variable.',
        path: ['components', 'servers', 'production', 'variables', 'anotherParam2'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);

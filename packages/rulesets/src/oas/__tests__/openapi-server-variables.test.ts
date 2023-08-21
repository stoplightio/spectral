import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('openapi-server-variables', [
  {
    name: 'valid case',
    document: {
      openapi: '3.1.0',
      servers: [
        {
          url: '{protocol}://{env}.stoplight.io:{port}',
          variables: {
            env: {
              default: 'v2',
            },
            protocol: {
              enum: ['http', 'https'],
              default: 'https',
            },
            port: {
              enum: ['80', '443'],
              default: '443',
            },
          },
        },
      ],
    },
    errors: [],
  },

  {
    name: 'server has not defined definition for one of the url variables',
    document: {
      openapi: '3.1.0',
      servers: [
        {
          url: '{protocol}://stoplight.io:{port}',
          variables: {},
        },
      ],
      paths: {
        '/': {
          servers: [
            {
              url: '{protocol}://stoplight.io',
              variables: {},
            },
          ],
          get: {
            servers: [
              {
                url: 'https://{env}.stoplight.io',
                variables: {},
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: 'Not all server\'s variables are described with "variables" object. Missed: protocol, port.',
        path: ['servers', '0', 'variables'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Not all server\'s variables are described with "variables" object. Missed: protocol.',
        path: ['paths', '/', 'servers', '0', 'variables'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Not all server\'s variables are described with "variables" object. Missed: env.',
        path: ['paths', '/', 'get', 'servers', '0', 'variables'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'server has redundant url variables',
    document: {
      openapi: '3.1.0',
      servers: [
        {
          url: 'https://stoplight.io:{port}',
          variables: {
            port: {
              default: '443',
            },
            env: {
              enum: ['staging', 'integration'],
            },
          },
        },
      ],
      paths: {
        '/': {
          servers: [
            {
              url: 'https://{env}.stoplight.io',
              variables: {
                port: {
                  default: '443',
                },
                env: {
                  enum: ['staging', 'integration'],
                },
              },
            },
          ],
          get: {
            servers: [
              {
                url: 'https://stoplight.io',
                variables: {
                  port: {},
                  env: {},
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: 'Server\'s "variables" object has redundant defined "env" url variable.',
        path: ['servers', '0', 'variables', 'env'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Server\'s "variables" object has redundant defined "port" url variable.',
        path: ['paths', '/', 'servers', '0', 'variables', 'port'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Server\'s "variables" object has redundant defined "port" url variable.',
        path: ['paths', '/', 'get', 'servers', '0', 'variables', 'port'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Server\'s "variables" object has redundant defined "env" url variable.',
        path: ['paths', '/', 'get', 'servers', '0', 'variables', 'env'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'server has an unlisted default',
    document: {
      openapi: '3.1.0',
      servers: [
        {
          url: 'https://stoplight.io:{port}',
          variables: {
            port: {
              enum: ['80'],
              default: '443',
            },
          },
        },
      ],
      paths: {
        '/': {
          servers: [
            {
              url: 'https://{env}.stoplight.io',
              variables: {
                env: {
                  enum: [],
                  default: 'staging',
                },
              },
            },
          ],
        },
      },
    },
    errors: [
      {
        message: 'Server Variable "port" has a default not listed in the enum',
        path: ['servers', '0', 'variables', 'port', 'default'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Server Variable "env" has a default not listed in the enum',
        path: ['paths', '/', 'servers', '0', 'variables', 'env', 'default'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'server has a server variable resulting in broken URL',
    document: {
      openapi: '3.1.0',
      servers: [
        {
          url: 'https://stoplight.io:{port}',
          variables: {
            port: {
              enum: ['invalid port', 'another-one', '443'],
            },
          },
        },
      ],
      paths: {
        '/': {
          servers: [
            {
              url: '{base}.test',
              variables: {
                base: {
                  enum: ['http', 'https', 'ftp', 'ftps', 'ssh', 'smtp'],
                },
              },
            },
          ],
        },
      },
    },
    errors: [
      {
        message:
          'A few substitutions of server variables resulted in invalid URLs: https://stoplight.io:invalid%20port, https://stoplight.io:another-one',
        path: ['servers', '0', 'variables'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message:
          'At least 5 substitutions of server variables resulted in invalid URLs: http.test, https.test, ftp.test, ftps.test, ssh.test and more',
        path: ['paths', '/', 'servers', '0', 'variables'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);

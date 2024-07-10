import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('oas3-server-variables', [
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
      paths: {
        '/': {
          servers: [],
          responses: {
            '2xx': {
              links: {
                user: {
                  $ref: '#/components/links/User',
                },
              },
            },
          },
        },
        '/user': {
          get: {
            operationId: 'getUser',
          },
        },
      },
      components: {
        links: {
          User: {
            operationId: 'getUser',
            parameters: [],
            server: {
              url: 'https://{env}.stoplight.io',
              variables: {
                env: {
                  default: 'v2',
                },
              },
            },
          },
        },
      },
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
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: 'Not all server\'s variables are described with "variables" object. Missed: protocol, port.',
        path: ['servers', '0'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Not all server\'s variables are described with "variables" object. Missed: protocol.',
        path: ['paths', '/', 'servers', '0', 'variables'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Not all server\'s variables are described with "variables" object. Missed: env.',
        path: ['paths', '/', 'get', 'servers', '0'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'server has unused url variables',
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
              default: 'staging',
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
                  default: 'staging',
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
        message: 'Server\'s "variables" object has unused defined "env" url variable.',
        path: ['servers', '0', 'variables', 'env'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Server\'s "variables" object has unused defined "port" url variable.',
        path: ['paths', '/', 'servers', '0', 'variables', 'port'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Server\'s "variables" object has unused defined "port" url variable.',
        path: ['paths', '/', 'get', 'servers', '0', 'variables', 'port'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Server\'s "variables" object has unused defined "env" url variable.',
        path: ['paths', '/', 'get', 'servers', '0', 'variables', 'env'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'server variable has a missing default',
    document: {
      openapi: '3.1.0',
      servers: [
        {
          url: 'https://{env}.stoplight.io',
          variables: {
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
              url: 'https://stoplight.io:{port}',
              variables: {
                port: {},
              },
            },
          ],
        },
      },
    },
    errors: [
      {
        code: 'oas3-server-variables',
        message: 'Server Variable "env" has a missing default.',
        path: ['servers', '0', 'variables', 'env'],
      },
      {
        code: 'oas3-server-variables',
        message: 'Server Variable "port" has a missing default.',
        path: ['paths', '/', 'servers', '0', 'variables', 'port'],
      },
    ],
  },

  {
    name: 'server variable has an unlisted default',
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
          operationId: 'test',
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
      components: {
        links: {
          Address: {
            operationId: 'test',
            server: {
              url: 'https://{env}.stoplight.io',
              variables: {
                env: {
                  enum: [],
                  default: 'staging',
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Server Variable "port" has a default not listed in the enum.',
        path: ['servers', '0', 'variables', 'port', 'default'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Server Variable "env" has a default not listed in the enum.',
        path: ['paths', '/', 'servers', '0', 'variables', 'env', 'default'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Server Variable "env" has a default not listed in the enum.',
        path: ['components', 'links', 'Address', 'server', 'variables', 'env', 'default'],
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
              default: '443',
            },
          },
        },
        {
          url: '{username}',
          variables: {
            username: {
              enum: ['stoplight', 'io'],
              default: 'stoplight',
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
                  default: 'https',
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
        message: 'A few substitutions of server variables resulted in invalid URLs: stoplight, io',
        path: ['servers', '1', 'variables'],
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

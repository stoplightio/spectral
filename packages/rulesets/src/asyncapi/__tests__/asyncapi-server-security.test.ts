import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('asyncapi-server-security', [
  {
    name: 'valid case',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          security: [
            {
              petstore_auth: [],
            },
          ],
        },
      },
      components: {
        securitySchemes: {
          petstore_auth: {},
        },
      },
    },
    errors: [],
  },

  {
    name: 'valid case (without security field)',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {},
      },
      components: {
        securitySchemes: {
          petstore_auth: {},
        },
      },
    },
    errors: [],
  },

  {
    name: 'valid case (oauth2)',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          security: [
            {
              petstore_auth: ['write:pets'],
            },
          ],
        },
      },
      components: {
        securitySchemes: {
          petstore_auth: {
            type: 'oauth2',
            flows: {
              implicit: {
                scopes: {
                  'write:pets': '...',
                  'read:pets': '...',
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
    name: 'invalid case',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          security: [
            {
              not_defined: [],
            },
          ],
        },
      },
      components: {
        securitySchemes: {
          petstore_auth: {},
        },
      },
    },
    errors: [
      {
        message: 'Server must not reference an undefined security scheme.',
        path: ['servers', 'production', 'security', '0', 'not_defined'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'invalid case (oauth2)',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          security: [
            {
              petstore_auth: ['write:pets', 'not:defined'],
            },
          ],
        },
      },
      components: {
        securitySchemes: {
          petstore_auth: {
            type: 'oauth2',
            flows: {
              implicit: {
                scopes: {
                  'write:pets': '...',
                  'read:pets': '...',
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Non-existing security scope for the specified security scheme. Available: [write:pets, read:pets]',
        path: ['servers', 'production', 'security', '0', 'petstore_auth', '1'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'invalid case (oauth2) - multiple flows and not defined scopes',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          security: [
            {
              petstore_auth: ['write:pets', 'not:defined1', 'not:defined2'],
            },
          ],
        },
      },
      components: {
        securitySchemes: {
          petstore_auth: {
            type: 'oauth2',
            flows: {
              implicit: {
                scopes: {
                  'write:pets': '...',
                  'read:pets': '...',
                },
              },
              password: {
                scopes: {
                  'write:dogs': '...',
                  'read:dogs': '...',
                },
              },
              clientCredentials: {
                scopes: {
                  'write:cats': '...',
                  'read:cats': '...',
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        message:
          'Non-existing security scope for the specified security scheme. Available: [write:pets, read:pets, write:dogs, read:dogs, write:cats, read:cats]',
        path: ['servers', 'production', 'security', '0', 'petstore_auth', '1'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message:
          'Non-existing security scope for the specified security scheme. Available: [write:pets, read:pets, write:dogs, read:dogs, write:cats, read:cats]',
        path: ['servers', 'production', 'security', '0', 'petstore_auth', '2'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'invalid case (oauth2) - not valid flow',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          security: [
            {
              petstore_auth: ['write:pets', 'not:defined'],
            },
          ],
        },
      },
      components: {
        securitySchemes: {
          petstore_auth: {
            type: 'oauth2',
            flows: {
              implicit: {
                scopes: {
                  'write:pets': '...',
                  'read:pets': '...',
                },
              },
              notDefinedFlow: {
                scopes: {
                  'write:dogs': '...',
                  'read:dogs': '...',
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Non-existing security scope for the specified security scheme. Available: [write:pets, read:pets]',
        path: ['servers', 'production', 'security', '0', 'petstore_auth', '1'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'invalid case (multiple securities)',
    document: {
      asyncapi: '2.0.0',
      servers: {
        production: {
          security: [
            {
              not_defined: [],
            },
            {
              petstore_auth: ['write:pets', 'not:defined'],
            },
          ],
        },
      },
      components: {
        securitySchemes: {
          petstore_auth: {
            type: 'oauth2',
            flows: {
              implicit: {
                scopes: {
                  'write:pets': '...',
                  'read:pets': '...',
                },
              },
              notDefinedFlow: {
                scopes: {
                  'write:dogs': '...',
                  'read:dogs': '...',
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Server must not reference an undefined security scheme.',
        path: ['servers', 'production', 'security', '0', 'not_defined'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Non-existing security scope for the specified security scheme. Available: [write:pets, read:pets]',
        path: ['servers', 'production', 'security', '1', 'petstore_auth', '1'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);

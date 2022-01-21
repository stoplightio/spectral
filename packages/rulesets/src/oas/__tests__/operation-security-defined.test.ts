import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('oas-security-defined', [
  {
    name: 'oas2: a correct object (just in body)',
    document: {
      securityDefinitions: {
        apikey: {},
      },
      paths: {
        '/path': {
          get: {
            security: [
              {
                apikey: [],
              },
            ],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'oas2: invalid object',
    document: {
      swagger: '2.0',
      securityDefinitions: {},
      paths: {
        '/path': {
          get: {
            security: [
              {
                apikey: [],
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message:
          'Operation "security" values must match a scheme defined in the "securityDefinitions"/"securitySchemes" object.',
        path: ['paths', '/path', 'get', 'security', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'oas3: securityScheme defined',
    document: {
      openapi: '3.0.0',

      paths: {
        '/resources': {
          get: {
            security: [
              {
                dummy_autheez: ['urn:my.dummy.scope.read_only', 'urn:my.precious.dummy.scope.read_only'],
              },
            ],
          },
        },
      },
      components: {
        securitySchemes: {
          dummy_auth: {
            type: 'oauth2',
            flows: {
              implicit: {
                authorizationUrl: 'https://auth.com',
                scopes: {
                  'urn:my.dummy.scope.read_only': 'Right to read.',
                  'urn.my.precious.scope.read_only': 'Right to read.',
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
          'Operation "security" values must match a scheme defined in the "securityDefinitions"/"securitySchemes" object.',
        path: ['paths', '/resources', 'get', 'security', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'oas3: validate a correct object (just in body)',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          apikey: {},
        },
      },
      paths: {
        '/path': {
          get: {
            security: [
              {
                apikey: [],
              },
            ],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'oas3: return errors on invalid object',
    document: {
      openapi: '3.0.2',
      components: {},
      paths: {
        '/path': {
          get: {
            security: [
              {
                apikey: [],
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message:
          'Operation "security" values must match a scheme defined in the "securityDefinitions"/"securitySchemes" object.',
        path: ['paths', '/path', 'get', 'security', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/tester';

testRule('oas3-operation-security-defined', [
  {
    name: 'valid case',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          apikey: {
            type: 'apiKey',
            name: 'api_key',
            in: 'header',
          },
        },
      },
      security: [
        {
          apikey: [],
        },
      ],
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
    name: 'valid and invalid object',
    document: {
      openapi: '3.0.2',
      components: {
        securitySchemes: {
          apikey: {
            type: 'apiKey',
            name: 'api_key',
            in: 'header',
          },
          oauth2: {
            type: 'oauth2',
            flows: {
              authorizationCode: {
                authorizationUrl: 'https://example.com/api/oauth/dialog',
                tokenUrl: 'https://example.com/api/oauth/token',
                scopes: {
                  'write:pets': 'modify pets in your account',
                  'read:pets': 'read your pets',
                },
              },
            },
          },
        },
      },
      security: [
        {
          apikey: [],
          basic: [],
          oauth2: ['write:pets'],
        },
        {},
        {
          oauth2: ['write:users', 'read:users'],
        },
      ],
      paths: {
        '/users': {
          get: {
            security: [
              {
                bearer: [],
                oauth2: [],
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: 'API "security" values must match a scheme defined in the "components.securitySchemes" object.',
        path: ['security', '0', 'basic'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: '"write:users" must be listed among scopes.',
        path: ['security', '2', 'oauth2', '0'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: '"read:users" must be listed among scopes.',
        path: ['security', '2', 'oauth2', '1'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Operation "security" values must match a scheme defined in the "components.securitySchemes" object.',
        path: ['paths', '/users', 'get', 'security', '0', 'bearer'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'missing securitySchemes',
    document: {
      openapi: '3.1.0',
      paths: {
        '/path': {
          get: {
            security: [
              {
                apikey: [],
                basic: [],
              },
              {},
            ],
          },
        },
      },
    },
    errors: [
      {
        message: 'Operation "security" values must match a scheme defined in the "components.securitySchemes" object.',
        path: ['paths', '/path', 'get', 'security', '0', 'apikey'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Operation "security" values must match a scheme defined in the "components.securitySchemes" object.',
        path: ['paths', '/path', 'get', 'security', '0', 'basic'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'invalid scopes in Security Scheme object',
    document: {
      openapi: '3.1.0',
      components: {
        securitySchemes: {
          authorizationCode: {
            type: 'oauth2',
            flows: {
              authorizationCode: {
                authorizationUrl: 'https://example.com/api/oauth/dialog',
                tokenUrl: 'https://example.com/api/oauth/token',
                scopes: null,
              },
            },
          },
          noFlows: {
            type: 'oauth2',
          },
          client: {
            type: 'oauth2',
            flows: {
              clientCredentials: null,
            },
          },
          broken: null,
        },
      },
      paths: {
        '/path': {
          get: {
            security: [
              {
                noFlows: ['read:users'],
                authorizationCode: ['write:users'],
                broken: ['delete:users'],
              },
              {
                noFlows: [],
                client: ['read:users'],
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: '"read:users" must be listed among scopes.',
        path: ['paths', '/path', 'get', 'security', '0', 'noFlows', '0'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: '"write:users" must be listed among scopes.',
        path: ['paths', '/path', 'get', 'security', '0', 'authorizationCode', '0'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: '"delete:users" must be listed among scopes.',
        path: ['paths', '/path', 'get', 'security', '0', 'broken', '0'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: '"read:users" must be listed among scopes.',
        path: ['paths', '/path', 'get', 'security', '1', 'client', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);

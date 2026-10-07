import { DiagnosticSeverity } from '@stoplight/types';
import * as path from '@stoplight/path';
import * as Parsers from '@stoplight/spectral-parsers';
import { Document } from '@stoplight/spectral-core';

import testRule from './__helpers__/tester';

const sharedDefsSource = path.join(__dirname, './__fixtures__/sharedSecurityDefinitions/common.json');
const sharedDefsDocument = new Document<any, any>(
  JSON.stringify({
    swagger: '2.0',
    securityDefinitions: {
      oauth2: { $ref: './common.json#/securityDefinitions/oauth2' },
      SharedOauth: {
        type: 'oauth2',
        flow: 'accessCode',
        authorizationUrl: 'https://example.com/api/oauth/dialog',
        tokenUrl: 'https://example.com/api/oauth/token',
        scopes: {
          'write:pets': 'modify pets in your account',
          'read:pets': 'read your pets',
        },
      },
    },
    paths: { '/path': { get: { security: [{ oauth2: ['write:pets'] }] } } },
  }),
  Parsers.Json,
  path.join(__dirname, './__fixtures__/sharedSecurityDefinitions/api.json'),
);

testRule('oas2-operation-security-defined', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
      securityDefinitions: {
        apikey: {
          type: 'apiKey',
          name: 'api_key',
          in: 'header',
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
      swagger: '2.0',
      securityDefinitions: {
        apikey: {
          type: 'apiKey',
          name: 'api_key',
          in: 'header',
        },
        oauth2: {
          type: 'oauth2',
          flows: 'accessCode',
          authorizationUrl: 'https://example.com/api/oauth/dialog',
          tokenUrl: 'https://example.com/api/oauth/token',
          scopes: {
            'write:pets': 'modify pets in your account',
            'read:pets': 'read your pets',
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
        message: 'API "security" values must match a scheme defined in the "securityDefinitions" object.',
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
        message: 'Operation "security" values must match a scheme defined in the "securityDefinitions" object.',
        path: ['paths', '/users', 'get', 'security', '0', 'bearer'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'missing securityDefinitions',
    document: {
      swagger: '2.0',
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
        message: 'Operation "security" values must match a scheme defined in the "securityDefinitions" object.',
        path: ['paths', '/path', 'get', 'security', '0', 'apikey'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        message: 'Operation "security" values must match a scheme defined in the "securityDefinitions" object.',
        path: ['paths', '/path', 'get', 'security', '0', 'basic'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'invalid scopes in Security Scheme object',
    document: {
      swagger: '2.0',
      securityDefinitions: {
        authorizationCode: {
          type: 'oauth2',
          flows: 'accessCode',
          authorizationUrl: 'https://example.com/api/oauth/dialog',
          tokenUrl: 'https://example.com/api/oauth/token',
          scopes: null,
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
      },
      paths: {
        '/path': {
          get: {
            security: [
              {
                noFlows: ['read:users'],
                authorizationCode: ['write:users'],
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
        message: '"read:users" must be listed among scopes.',
        path: ['paths', '/path', 'get', 'security', '1', 'client', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },

  {
    name: 'valid scopes in a security scheme defined in an external file',
    document: sharedDefsDocument,
    errors: [],
    mocks: {
      [sharedDefsSource]: {
        securityDefinitions: {
          oauth2: sharedDefsDocument.data.securityDefinitions.SharedOauth,
        },
      },
    },
  },

  {
    name: 'valid scopes through a local $ref without a document source',
    document: {
      ...sharedDefsDocument.data,
      securityDefinitions: {
        ...sharedDefsDocument.data.securityDefinitions,
        oauth2: { $ref: '#/securityDefinitions/SharedOauth' },
      },
    },
    errors: [],
  },

  {
    name: 'valid scopes in a security scheme at an external document root',
    document: new Document(
      JSON.stringify({
        ...sharedDefsDocument.data,
        securityDefinitions: { oauth2: { $ref: './common.json' } },
      }),
      Parsers.Json,
      path.join(__dirname, './__fixtures__/sharedSecurityDefinitions/root/api.json'),
    ),
    errors: [],
    mocks: {
      [path.join(__dirname, './__fixtures__/sharedSecurityDefinitions/root/common.json')]:
        sharedDefsDocument.data.securityDefinitions.SharedOauth,
    },
  },
]);

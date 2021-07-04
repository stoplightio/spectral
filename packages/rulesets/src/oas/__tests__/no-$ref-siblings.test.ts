import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('no-$ref-siblings', [
  {
    name: 'valid case',
    document: {
      swagger: '2.0',
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
    name: '$ref siblings are present',
    document: {
      $ref: '#/',
      responses: {
        200: {
          description: 'a',
        },
        201: {
          description: 'b',
        },
        300: {
          description: 'c',
          abc: 'd',
          $ref: '#/d',
        },
      },
      openapi: '3.0.0',
    },
    errors: [
      {
        message: '$ref must not be placed next to any other properties',
        path: ['responses'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '$ref must not be placed next to any other properties',
        path: ['responses', '300', 'description'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '$ref must not be placed next to any other properties',
        path: ['responses', '300', 'abc'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '$ref must not be placed next to any other properties',
        path: ['openapi'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: '$ref siblings in a oas2 document',
    document: {
      swagger: '2.0',
      securityDefinitions: {
        apikey: {},
        $ref: '#/securityDefinitions/apikey',
      },
      paths: {
        $ref: '#/securityDefinitions/apikey',
        '/path': {
          post: {},
          $ref: '#/foo/bar',
          get: {
            $ref: '#/da',
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
        message: '$ref must not be placed next to any other properties',
        path: ['securityDefinitions', 'apikey'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '$ref must not be placed next to any other properties',
        path: ['paths', '/path'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '$ref must not be placed next to any other properties',
        path: ['paths', '/path', 'post'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '$ref must not be placed next to any other properties',
        path: ['paths', '/path', 'get'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'no-$ref-siblings',
        message: '$ref must not be placed next to any other properties',
        path: ['paths', '/path', 'get', 'security'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: '$ref siblings in a oas3 document',
    document: {
      openapi: '3.0.3',
      components: {
        securityDefinitions: {
          apikey: {},
          $ref: '#/components/securityDefinitions/apikey',
        },
      },
      paths: {
        $ref: '#/components/securityDefinitions/apikey',
        '/path': {
          post: {},
          $ref: '#/foo/bar',
          get: {
            $ref: '#/da',
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
        message: '$ref must not be placed next to any other properties',
        path: ['components', 'securityDefinitions', 'apikey'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '$ref must not be placed next to any other properties',
        path: ['paths', '/path'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '$ref must not be placed next to any other properties',
        path: ['paths', '/path', 'post'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '$ref must not be placed next to any other properties',
        path: ['paths', '/path', 'get'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: '$ref must not be placed next to any other properties',
        path: ['paths', '/path', 'get', 'security'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);

import { DiagnosticSeverity } from '@stoplight/types';

import testRule from '../../__tests__/__helpers__/tester';

testRule('array-items', [
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
    name: 'array items sibling is present',
    document: {
      $ref: '#/',
      responses: {
        200: {
          type: 'array',
          items: {},
        },
        201: {
          type: 'array',
          items: {
            type: 'array',
            items: {},
          },
        },
      },
      openapi: '3.0.0',
    },
    errors: [],
  },
  {
    name: 'array items sibling is missing',
    document: {
      $ref: '#/',
      responses: {
        200: {
          type: 'array',
        },
        201: {
          type: 'array',
          items: {
            type: 'array',
          },
        },
      },
      openapi: '3.0.0',
    },
    errors: [
      {
        code: 'array-items',
        message: 'Schemas with "type: array", require a sibling "items" field',
        path: ['responses', '200'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'array-items',
        message: 'Schemas with "type: array", require a sibling "items" field',
        path: ['responses', '201', 'items'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);

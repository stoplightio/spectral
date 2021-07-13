import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas3-schema', [
  {
    name: 'human-readable Ajv errors',
    document: require('./__fixtures__/petstore.invalid-schema.oas3.json'),
    errors: [
      {
        message: '"email" property must match format "email".',
        path: ['info', 'contact', 'email'],
      },
      {
        message: '"header-1" property must have required property "schema".',
        path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1'],
      },
      {
        message: 'Property "type" is not expected to be here.',
        path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1', 'type'],
      },
      {
        message: 'Property "op" is not expected to be here.',
        path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1', 'op'],
      },
    ],
  },

  {
    name: 'sibling additionalProperties errors',
    document: {
      openapi: '3.0.0',
      info: {
        title: 'Siblings',
        version: '1.0',
      },
      servers: [
        {
          url: 'http://petstore.swagger.io/v1',
        },
      ],
      tags: [
        {
          name: 'pets',
        },
      ],
      paths: {
        '/pets': {
          post: {
            description: 'Add a new pet to the store',
            summary: 'Create pet',
            operationId: 'create_pet',
            tags: ['pets'],
            requestBody: {
              description: 'Pet object that needs to be added to the store',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
            responses: {
              '204': {
                description: 'Success',
              },
              '400': {
                description: 'Bad request',
              },
              '42': {
                description: 'The answer to life, the universe, and everything',
              },
              '9999': {
                description: 'Four digits must be better than three',
              },
              '5xx': {
                description: 'Sumpin bad happened',
              },
              default: {
                description: 'Error',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        message: 'Property "42" is not expected to be here.',
        path: ['paths', '/pets', 'post', 'responses', '42'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Property "9999" is not expected to be here.',
        path: ['paths', '/pets', 'post', 'responses', '9999'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Property "5xx" is not expected to be here.',
        path: ['paths', '/pets', 'post', 'responses', '5xx'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'oas3.1: jsonSchemaDialect',
    document: {
      openapi: '3.1.0',
      info: {
        title: 'Example jsonSchemaDialect error',
        version: '1.0.0',
      },
      paths: {},
      jsonSchemaDialect: null,
    },
    errors: [
      {
        message: '"jsonSchemaDialect" property type must be string.',
        path: ['jsonSchemaDialect'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'oas3.1: missing webhooks/components/paths',
    document: {
      openapi: '3.1.0',
      info: {
        title: 'Missing webhooks/components/paths',
        version: '1.0.0',
      },
    },
    errors: [
      {
        message: 'The document must have either "paths", "webhooks" or "components".',
        path: [],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'oas3.1: paths is not required',
    document: {
      openapi: '3.1.0',
      info: {
        title: 'Example jsonSchemaDialect error',
        version: '1.0.0',
      },
      webhooks: {},
    },
    errors: [],
  },
]);

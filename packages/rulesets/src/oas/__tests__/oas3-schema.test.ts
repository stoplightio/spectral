import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas3-schema', [
  {
    name: 'human-readable Ajv errors',
    document: {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'Swagger Petstore',
        license: {
          name: 'MIT',
        },
        contact: {
          email: 'bar@foo',
        },
        description: 'test',
      },
      servers: [
        {
          url: 'http://petstore.swagger.io/v1',
        },
      ],
      paths: {
        '/pets': {
          get: {
            summary: 'List all pets',
            operationId: 'listPets',
            description: 'test',
            tags: ['pets'],
            parameters: [
              {
                name: 'limit',
                in: 'query',
                description: 'How many items to return at one time (max 100)',
                required: false,
                schema: {
                  type: 'integer',
                  format: 'int32',
                },
              },
            ],
            responses: {
              '200': {
                description: 'A paged array of pets',
                headers: {
                  'x-next': {
                    description: 'A link to the next page of responses',
                    schema: {
                      type: 'string',
                    },
                  },
                  'header-1': {
                    type: 'string',
                    op: 'foo',
                  },
                },
                content: {
                  'application/json': {
                    schema: {
                      $ref: './models/pet.yaml',
                    },
                  },
                },
              },
              default: {
                description: 'unexpected error',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '../common/models/error.yaml',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Pets: {
            type: 'array',
            items: {
              $ref: './models/pet.yaml',
            },
            'x-tags': ['Pets'],
            title: 'Pets',
            description: 'A list of pets.',
          },
        },
      },
    },
    errors: [
      {
        message: '"email" property must match format "email".',
        path: ['info', 'contact', 'email'],
      },
      {
        message: '"schema" or "content" must be present.',
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
        message: '"jsonSchemaDialect" property must be string.',
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

  {
    name: 'oas3.1: uri template as server url',
    document: {
      openapi: '3.1.0',
      info: {
        title: 'Server URL may have variables',
        version: '1.0.0',
      },
      webhooks: {},
      // https://spec.openapis.org/oas/v3.1.0#server-object-example
      servers: [
        {
          url: 'https://{username}.gigantic-server.com:{port}/{basePath}',
          description: 'The production API server',
          variables: {
            username: {
              default: 'demo',
              description: 'this value is assigned by the service provider, in this example `gigantic-server.com`',
            },
            port: {
              enum: ['8443', '443'],
              default: '8443',
            },
            basePath: {
              default: 'v2',
            },
          },
        },
      ],
    },
    errors: [],
  },

  {
    name: 'oas3.0: validate parameters',
    document: {
      openapi: '3.0.1',
      info: {
        title: 'response example',
        version: '1.0',
      },
      paths: {
        '/user': {
          get: {
            responses: {
              200: {
                description: 'dummy description',
              },
            },
            parameters: [
              {
                name: 'cookie',
                in: ' cookie',
                required: true,
                schema: {
                  type: ['string', 'number'],
                },
              },
              {
                name: 'module_id',
                required: true,
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'size',
                in: 'query',
                required: true,
                schema: {
                  type: 'numbers',
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message:
          '"in" property must be equal to one of the allowed values: "path", "query", "header", "cookie". Did you mean "cookie"?.',
        path: ['paths', '/user', 'get', 'parameters', '0', 'in'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message:
          '"type" property must be equal to one of the allowed values: "array", "boolean", "integer", "number", "object", "string".',
        path: ['paths', '/user', 'get', 'parameters', '0', 'schema', 'type'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Parameter must have a valid "in" property.',
        path: ['paths', '/user', 'get', 'parameters', '1'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message:
          '"type" property must be equal to one of the allowed values: "array", "boolean", "integer", "number", "object", "string". Did you mean "number"?.',
        path: ['paths', '/user', 'get', 'parameters', '2', 'schema', 'type'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'oas3.0: validate security schemes',
    document: {
      openapi: '3.0.1',
      info: {
        title: 'response example',
        version: '1.0',
      },
      paths: {
        '/user': {
          get: {
            responses: {
              200: {
                description: 'dummy description',
              },
            },
          },
        },
      },
      components: {
        securitySchemes: {
          basic: {
            foo: 2,
          },
          http: {
            type: 'https',
            scheme: 'basic',
          },
          apiKey: null,
        },
      },
    },
    errors: [
      {
        message: 'Security scheme must have a valid type.',
        path: ['components', 'securitySchemes', 'basic'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message:
          '"type" property must be equal to one of the allowed values: "apiKey", "http", "oauth2", "openIdConnect". Did you mean "http"?.',
        path: ['components', 'securitySchemes', 'http', 'type'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Invalid security scheme.',
        path: ['components', 'securitySchemes', 'apiKey'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'oas3.0: validate responses',
    document: {
      openapi: '3.0.1',
      info: {
        title: 'response example',
        version: '1.0',
      },
      paths: {
        '/user': {
          get: {
            operationId: 'd',
            responses: {
              200: {},
            },
          },
          post: {
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
        message: '"200" property must have required property "description".',
        path: ['paths', '/user', 'get', 'responses', '200'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Property "42" is not expected to be here.',
        path: ['paths', '/user', 'post', 'responses', '42'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Property "9999" is not expected to be here.',
        path: ['paths', '/user', 'post', 'responses', '9999'],
        severity: DiagnosticSeverity.Error,
      },
      {
        message: 'Property "5xx" is not expected to be here.',
        path: ['paths', '/user', 'post', 'responses', '5xx'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);

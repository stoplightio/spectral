import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

const MSG = '$ref must not be placed next to any properties other than "summary" and "description"';

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

testRule('no-$ref-siblings', [
  ...['3.1.0', '3.2.0'].flatMap(openapi => [
    {
      name: `$ref siblings within schemas are allowed in an oas ${openapi} document`,
      document: {
        openapi,
        paths: {
          '/path': {
            get: {
              parameters: [
                {
                  name: 'id',
                  in: 'query',
                  schema: {
                    $ref: '#/components/schemas/Id',
                    description: 'an id',
                    minLength: 1,
                  },
                },
              ],
              responses: {
                200: {
                  description: 'ok',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          foo: {
                            $ref: '#/components/schemas/Id',
                            example: 'abc',
                          },
                        },
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
            Id: {
              type: 'string',
            },
            Foo: {
              $ref: '#/components/schemas/Id',
              maxLength: 10,
            },
          },
        },
      },
      errors: [],
    },
    {
      name: `$ref summary and description siblings are allowed in an oas ${openapi} document`,
      document: {
        openapi,
        paths: {
          '/path': {
            get: {
              parameters: [
                {
                  $ref: '#/components/parameters/Id',
                  summary: 'a summary',
                  description: 'a description',
                },
              ],
              responses: {
                200: {
                  $ref: '#/components/responses/Ok',
                  description: 'ok',
                },
              },
            },
          },
        },
      },
      errors: [],
    },
    {
      name: `$ref siblings outside of schemas in an oas ${openapi} document`,
      document: {
        openapi,
        paths: {
          '/path': {
            get: {
              parameters: [
                {
                  $ref: '#/components/parameters/Id',
                  description: 'a description',
                  required: true,
                },
              ],
              responses: {
                200: {
                  $ref: '#/components/responses/Ok',
                  summary: 'a summary',
                  headers: {},
                },
              },
            },
          },
        },
        components: {
          responses: {
            NotFound: {
              $ref: '#/components/responses/Ok',
              content: {},
            },
          },
        },
      },
      errors: [
        {
          message: '$ref must not be placed next to any properties other than "summary" and "description"',
          path: ['paths', '/path', 'get', 'parameters', '0', 'required'],
          severity: DiagnosticSeverity.Error,
        },
        {
          message: '$ref must not be placed next to any properties other than "summary" and "description"',
          path: ['paths', '/path', 'get', 'responses', '200', 'headers'],
          severity: DiagnosticSeverity.Error,
        },
        {
          message: '$ref must not be placed next to any properties other than "summary" and "description"',
          path: ['components', 'responses', 'NotFound', 'content'],
          severity: DiagnosticSeverity.Error,
        },
      ],
    },
    {
      name: `$ref siblings under components named like OAS keywords in an oas ${openapi} document`,
      document: {
        openapi,
        components: {
          responses: {
            schema: { $ref: '#/components/responses/Ok', content: {} },
          },
          examples: {
            example: { $ref: '#/components/examples/Other', value: 1 },
          },
        },
        paths: {
          '/schema': {
            get: {
              callbacks: {
                cb: { $ref: '#/components/callbacks/Cb', description: 'ok', extra: true },
              },
            },
          },
        },
      },
      errors: [
        { message: MSG, path: ['components', 'responses', 'schema', 'content'], severity: DiagnosticSeverity.Error },
        { message: MSG, path: ['components', 'examples', 'example', 'value'], severity: DiagnosticSeverity.Error },
        {
          message: MSG,
          path: ['paths', '/schema', 'get', 'callbacks', 'cb', 'extra'],
          severity: DiagnosticSeverity.Error,
        },
      ],
    },
    {
      name: `$ref siblings in Path Items and example data in an oas ${openapi} document`,
      document: {
        openapi,
        paths: {
          '/pets': { $ref: '#/components/pathItems/Pets', parameters: [], servers: [] },
          '/a': {
            get: {
              callbacks: {
                cb: { '{$request.body#/url}': { $ref: '#/components/pathItems/Pet', post: {} } },
              },
              responses: {
                200: {
                  description: 'ok',
                  content: {
                    'application/json': {
                      example: { $ref: 'https://example.com/base.json', type: 'object' },
                      examples: {
                        user: { value: { $ref: 'https://example.com/base.json', title: 'User', type: 'object' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        webhooks: {
          newPet: { $ref: '#/components/pathItems/NewPet', post: {} },
        },
        components: {
          pathItems: {
            Pet: { $ref: 'other.yaml', get: {} },
          },
        },
      },
      errors: [],
    },
  ]),
]);

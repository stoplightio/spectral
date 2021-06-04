import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas3-valid-schema-example', [
  ...['components', 'headers'].flatMap(field => [
    {
      name: `${field} containing a valid simple example`,
      document: {
        openapi: '3.0.2',
        [field]: {
          schemas: {
            xoxo: {
              type: 'string',
              example: 'doggie',
            },
          },
        },
      },
      errors: [],
    },

    {
      name: `${field} containing a valid default example`,
      document: {
        openapi: '3.0.2',
        [field]: {
          schemas: {
            xoxo: {
              type: 'string',
              example: 'doggie',
            },
          },
        },
      },
      errors: [],
    },

    {
      name: `invalid simple example in ${field}`,
      document: {
        openapi: '3.0.2',
        [field]: {
          schemas: {
            xoxo: {
              type: 'string',
              example: 123,
            },
          },
        },
      },
      errors: [
        {
          message: '`example` property type must be string',
          path: [field, 'schemas', 'xoxo', 'example'],
          severity: DiagnosticSeverity.Error,
        },
      ],
    },

    {
      name: `${field} containing an invalid default example`,
      document: {
        openapi: '3.0.2',
        [field]: {
          schemas: {
            xoxo: {
              type: 'string',
              default: 2,
            },
          },
        },
      },
      errors: [
        {
          message: '`default` property type must be string',
          severity: DiagnosticSeverity.Error,
          path: [field, 'schemas', 'xoxo', 'default'],
        },
      ],
    },

    {
      name: `${field} containing valid parents examples which contain invalid child examples`,
      document: {
        openapi: '3.0.2',
        [field]: {
          schemas: {
            post: {
              schema: {
                type: 'object',
                example: {
                  a: {
                    b: {
                      c: 'foo',
                    },
                  },
                },
                properties: {
                  a: {
                    type: 'object',
                    example: {
                      b: {
                        c: 'foo',
                      },
                    },
                    properties: {
                      b: {
                        type: 'object',
                        properties: {
                          c: {
                            type: 'string',
                            example: 12345,
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
      },
      errors: [
        {
          message: '`example` property type must be string',
          path: [
            field,
            'schemas',
            'post',
            'schema',
            'properties',
            'a',
            'properties',
            'b',
            'properties',
            'c',
            'example',
          ],
          severity: DiagnosticSeverity.Error,
        },
      ],
    },

    ...['', null, 0, false].flatMap(value => ({
      name: `${field} containing a falsy ${value} value`,
      document: {
        openapi: '3.0.2',
        [field]: {
          schemas: {
            xoxo: {
              enum: ['a', 'b'],
              example: value,
            },
          },
        },
      },
      errors: [
        {
          message: '`example` property must be equal to one of the allowed values: `a`, `b`',
          path: [field, 'schemas', 'xoxo', 'example'],
          severity: DiagnosticSeverity.Error,
        },
      ],
    })),

    {
      name: `${field} containing a valid complex example`,
      document: {
        openapi: '3.0.2',
        [field]: {
          schemas: {
            xoxo: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                },
                width: {
                  type: 'integer',
                },
                height: {
                  type: 'integer',
                },
              },
              required: ['url'],
              example: {
                url: 'images/38.png',
                width: 100,
                height: 100,
              },
            },
          },
        },
      },

      errors: [],
    },

    {
      name: `invalid complex example in ${field}`,
      document: {
        openapi: '3.0.2',
        [field]: {
          schemas: {
            xoxo: {
              type: 'number',
              example: 4,
            },
            abc: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  format: 'int64',
                },
                name: {
                  type: 'string',
                },
                abc: {
                  type: 'number',
                  example: '5',
                },
              },
              required: ['name'],
              example: {
                name: 'Puma',
                id: 1,
              },
            },
          },
        },
      },
      errors: [
        {
          message: '`example` property type must be number',
          severity: DiagnosticSeverity.Error,
          path: [field, 'schemas', 'abc', 'properties', 'abc', 'example'],
        },
      ],
    },

    {
      name: 'will error with totally invalid input',
      document: {
        openapi: '3.0.2',
        [field]: {
          schemas: {
            xoxo: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                },
                width: {
                  type: 'integer',
                },
                height: {
                  type: 'integer',
                },
              },
              required: ['url'],
              example: {
                url2: 'images/38.png',
                width: 'coffee',
                height: false,
              },
            },
          },
        },
      },

      errors: [
        {
          code: 'oas3-valid-schema-example',
          message: '`example` property must have required property `url`',
          severity: DiagnosticSeverity.Error,
        },
      ],
    },

    {
      name: 'unknown AJV formats',
      document: {
        openapi: '3.0.2',
        [field]: {
          xoxo: {
            schema: {
              type: 'object',
              properties: {
                ip_address: {
                  type: 'integer',
                  format: 'foo',
                  example: 2886989840,
                },
              },
            },
          },
        },
      },
      errors: [],
    },
  ]),

  {
    name: 'parameter containing a valid simple example',
    document: {
      openapi: '3.0.2',
      paths: {
        '/pet': {
          post: {
            parameters: [
              {
                schema: {
                  type: 'string',
                  example: 'doggie',
                },
              },
            ],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'parameter containing valid parents examples which contain invalid child examples',
    document: {
      openapi: '3.0.2',
      paths: {
        '/pet': {
          post: {
            parameters: [
              {
                in: 'body',
                name: 'body',
                required: true,
                schema: {
                  type: 'object',
                  example: {
                    a: {
                      b: {
                        c: 'foo',
                      },
                    },
                  },
                  properties: {
                    a: {
                      type: 'object',
                      example: {
                        b: {
                          c: 'foo',
                        },
                      },
                      properties: {
                        b: {
                          type: 'object',
                          properties: {
                            c: {
                              type: 'string',
                              example: 12345,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            ],
            responses: {
              '200': {
                description: 'OK',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        message: '`example` property type must be string',
        path: [
          'paths',
          '/pet',
          'post',
          'parameters',
          '0',
          'schema',
          'properties',
          'a',
          'properties',
          'b',
          'properties',
          'c',
          'example',
        ],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'parameter containing an actual property is called example',
    document: {
      openapi: '3.0.2',
      paths: {
        '/pet': {
          post: {
            parameters: [
              {
                in: 'body',
                type: 'object',
                properties: {
                  example: {
                    description: 'an actual field called example...',
                    type: 'string',
                  },
                },
                example: {
                  example: 'what is gonna happen',
                },
              },
            ],
          },
        },
      },
    },

    errors: [],
  },

  {
    name: 'parameter containing an actual property is called example and there is also type/format property',
    document: {
      openapi: '3.0.2',
      paths: {
        '/pet': {
          post: {
            parameters: [
              {
                type: 'object',
                properties: {
                  example: {
                    type: 'string',
                    example: 'abc',
                  },
                  type: {
                    type: 'number',
                    example: 123,
                  },
                  format: 'plain text',
                },
              },
            ],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'parameter containing invalid simple example',
    document: {
      openapi: '3.0.2',
      paths: {
        '/pet': {
          post: {
            parameters: [
              {
                schema: {
                  type: 'string',
                  example: 123,
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        severity: DiagnosticSeverity.Error,
        message: '`example` property type must be string',
        path: ['paths', '/pet', 'post', 'parameters', '0', 'schema', 'example'],
      },
    ],
  },

  {
    name: 'parameter containing valid complex example',
    document: {
      openapi: '3.0.2',
      paths: {
        '/pet': {
          post: {
            parameters: [
              {
                schema: {
                  type: 'object',
                  properties: {
                    url: {
                      type: 'string',
                    },
                    width: {
                      type: 'integer',
                    },
                    height: {
                      type: 'integer',
                    },
                  },
                  required: ['url'],
                  example: {
                    url: 'images/38.png',
                    width: 100,
                    height: 100,
                  },
                },
              },
            ],
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'parameter containing invalid complex example',
    document: {
      openapi: '3.0.2',
      paths: {
        '/pet': {
          post: {
            parameters: [
              {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      format: 'int64',
                    },
                    name: {
                      type: 'string',
                    },
                    abc: {
                      type: 'number',
                      example: '5',
                    },
                  },
                  required: ['name'],
                  example: {
                    name: 'Puma',
                    id: 1,
                  },
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: '`example` property type must be number',
        severity: DiagnosticSeverity.Error,
        path: ['paths', '/pet', 'post', 'parameters', '0', 'schema', 'properties', 'abc', 'example'],
      },
    ],
  },

  {
    name: 'parameter containing totally invalid input',
    document: {
      openapi: '3.0.2',
      paths: {
        '/pet': {
          post: {
            parameters: [
              {
                schema: {
                  type: 'object',
                  properties: {
                    url: {
                      type: 'string',
                    },
                    width: {
                      type: 'integer',
                    },
                    height: {
                      type: 'integer',
                    },
                  },
                  required: ['url'],
                  example: {
                    url2: 'images/38.png',
                    width: 'coffee',
                    height: false,
                  },
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        message: '`example` property must have required property `url`',
        severity: DiagnosticSeverity.Error,
        path: ['paths', '/pet', 'post', 'parameters', '0', 'schema', 'example'],
      },
    ],
  },
]);

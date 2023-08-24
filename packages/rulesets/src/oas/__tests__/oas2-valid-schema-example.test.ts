import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas2-valid-schema-example', [
  ...['parameters', 'definitions'].flatMap(parentField => [
    ...['example', 'x-example'].flatMap(field => [
      {
        name: `${field} in ${parentField} is valid`,
        document: {
          swagger: '2.0',
          [parentField]: [
            {
              in: 'body',
              schema: {
                type: 'string',
                [field]: 'doggie',
              },
            },
          ],
        },
        errors: [],
      },

      {
        name: `${field} in ${parentField} is invalid`,
        document: {
          swagger: '2.0',
          [parentField]: [
            {
              xoxo: {
                type: 'string',
                [field]: 123,
              },
            },
          ],
        },
        errors: [
          {
            message: `"${field}" property type must be string`,
            severity: DiagnosticSeverity.Error,
            path: [parentField, '0', 'xoxo', field],
          },
        ],
      },

      ...['', null, 0, false].map(value => ({
        name: `falsy ${value} value in ${field}`,
        document: {
          swagger: '2.0',
          [parentField]: [
            {
              xoxo: {
                enum: ['a', 'b'],
                [field]: value,
              },
            },
          ],
        },
        errors: [
          {
            message: `"${field}" property must be equal to one of the allowed values: "a", "b"`,
            path: [parentField, '0', 'xoxo', field],
            severity: DiagnosticSeverity.Error,
          },
        ],
      })),
    ]),

    {
      name: 'both examples are valid',
      document: {
        swagger: '2.0',
        [parentField]: [
          {
            in: 'body',
            schema: {
              type: 'string',
              example: 'doggie',
              'x-example': 'doggie',
            },
          },
        ],
      },
      errors: [],
    },

    {
      name: 'the default value is valid',
      document: {
        swagger: '2.0',
        [parentField]: [
          {
            in: 'body',
            schema: {
              type: 'string',
              default: '2',
            },
          },
        ],
      },
      errors: [],
    },

    {
      name: 'one of examples is invalid',
      document: {
        swagger: '2.0',
        [parentField]: [
          {
            in: 'body',
            schema: {
              type: 'string',
              example: 'doggie',
              'x-example': 2,
            },
          },
        ],
      },
      errors: [
        {
          message: '"x-example" property type must be string',
          path: [parentField, '0', 'schema', 'x-example'],
          severity: DiagnosticSeverity.Error,
        },
      ],
    },

    {
      name: 'the default value is invalid',
      document: {
        swagger: '2.0',
        [parentField]: [
          {
            in: 'body',
            schema: {
              type: 'string',
              default: 2,
            },
          },
        ],
      },
      errors: [
        {
          message: '"default" property type must be string',
          path: [parentField, '0', 'schema', 'default'],
          severity: DiagnosticSeverity.Error,
        },
      ],
    },

    {
      name: 'valid complex example',
      document: {
        swagger: '2.0',
        [parentField]: [
          {
            in: 'body',
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
      errors: [],
    },

    {
      name: 'totally invalid input',
      document: {
        swagger: '2.0',
        [parentField]: [
          {
            in: 'body',
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
      errors: [
        {
          message: '"example" property must have required property "url"',
          severity: DiagnosticSeverity.Error,
          path: [parentField, '0', 'schema', 'example'],
        },
      ],
    },

    {
      name: 'an actual property is called example and there is also type/format property',
      document: {
        swagger: '2.0',
        [parentField]: [
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
      errors: [],
    },
  ]),

  {
    name: 'contains allOf $ref',
    document: {
      swagger: '2.0',
      definitions: {
        halRoot: {
          type: 'object',
          allOf: [
            {
              $ref: '#/definitions/halResource',
            },
          ],
          example: {
            _links: {
              self: {
                href: '/',
              },
              products: {
                href: '/products',
              },
              product: {
                href: '/products/{product_id}',
              },
              users: {
                href: '/users',
              },
            },
          },
        },
        halResource: {
          title: 'HAL Resource Object',
          type: 'object',
          properties: {
            _links: {
              type: 'object',
              additionalProperties: {
                allOf: [
                  {
                    $ref: '#/definitions/halLinkObject',
                  },
                  {
                    type: 'array',
                    items: [
                      {
                        $ref: '#/definitions/halLinkObject',
                      },
                    ],
                  },
                ],
              },
            },
            _embedded: {
              type: 'object',
              additionalProperties: true,
            },
          },
        },
        halLinkObject: {
          type: 'object',
          required: ['href'],
          properties: {
            href: {
              type: 'string',
            },
          },
        },
      },
    },

    errors: [
      {
        message: '"self" property type must be array',
        path: ['definitions', 'halRoot', 'example', '_links', 'self'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'valid parents examples which contain invalid child examples',
    document: {
      swagger: '2.0',
      definitions: [
        {
          xoxo: {
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
    },
    errors: [
      {
        message: '"example" property type must be string',
        path: ['definitions', '0', 'xoxo', 'properties', 'a', 'properties', 'b', 'properties', 'c', 'example'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'an actual property is called example',
    document: {
      swagger: '2.0',
      definitions: {
        xoxo: {
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
      },
    },
    errors: [],
  },

  {
    name: 'valid required query paramater',
    document: {
      swagger: '2.0',
      paths: {
        '/route': {
          get: {
            parameters: [
              {
                name: 'id',
                in: 'query',
                required: true,
                type: 'number',
                'x-example': 10,
              },
            ],
          },
        },
      },
    },
    errors: [],
  },
]);

import { DiagnosticSeverity } from '@stoplight/types';
import testRule from '../../__tests__/__helpers__/tester';

testRule('oas3-valid-media-example', [
  ...['headers', 'content'].flatMap(field => [
    {
      name: `${field} containing a valid simple example`,
      document: {
        openapi: '3.0.0',
        [field]: {
          xoxo: {
            schema: {
              type: 'string',
            },
            example: 'doggie',
          },
        },
      },
      errors: [],
    },

    {
      name: `${field} containing an invalid simple example`,
      document: {
        openapi: '3.0.0',
        [field]: {
          xoxo: {
            schema: {
              type: 'string',
            },
            example: 123,
          },
        },
      },
      errors: [
        {
          message: '"example" property type must be string',
          path: [field, 'xoxo', 'example'],
          severity: DiagnosticSeverity.Error,
        },
      ],
    },

    ...['', null, 0, false].map(value => ({
      name: `${field} containing falsy ${value} value`,
      document: {
        openapi: '3.0.2',
        [field]: {
          xoxo: {
            schema: {
              enum: ['a', 'b'],
            },
            example: value,
          },
        },
      },

      errors: [
        {
          message: '"example" property must be equal to one of the allowed values: "a", "b"',
          path: [field, 'xoxo', 'example'],
          severity: DiagnosticSeverity.Error,
        },
      ],
    })),

    {
      name: `${field} containing a valid complex example`,
      document: {
        openapi: '3.0.0',
        [field]: {
          xoxo: {
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
            },
            example: {
              url: 'images/38.png',
              width: 100,
              height: 100,
            },
          },
        },
      },
      errors: [],
    },

    {
      name: `${field} containing an invalid complex example`,
      document: {
        openapi: '3.0.0',
        [field]: {
          xoxo: {
            schema: {
              type: 'number',
            },
            example: 4,
          },
          abc: {
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
            },
            example: {
              name: 'Puma',
              id: 1,
            },
          },
        },
      },
      errors: [],
    },

    {
      name: `${field} containing a totally invalid input`,
      document: {
        openapi: '3.0.0',
        [field]: {
          xoxo: {
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
                email: {
                  type: 'string',
                  format: 'email',
                },
              },
              required: ['url'],
            },
            example: {
              url2: 'images/38.png',
              width: 'coffee',
              height: false,
              email: 123,
            },
          },
        },
      },
      errors: [
        {
          message: '"example" property must have required property "url"',
          path: [field, 'xoxo', 'example'],
          severity: DiagnosticSeverity.Error,
        },
      ],
    },

    {
      name: 'present externalValue',
      document: {
        openapi: '3.0.0',
        [field]: {
          xoxo: {
            schema: {
              type: 'string',
            },
            examples: {
              test1: {
                externalValue: 'http://example.com/foobar.json',
              },
            },
          },
        },
      },
      errors: [],
    },

    {
      name: 'unknown AJV formats',
      document: {
        openapi: '3.0.0',
        [field]: {
          xoxo: {
            schema: {
              type: 'string',
              format: 'foo',
            },
            example: 'abc',
          },
        },
      },
      errors: [],
    },

    {
      name: `${field} containing invalid simple example in examples`,
      document: {
        openapi: '3.0.0',
        [field]: {
          xoxo: {
            schema: {
              type: 'string',
            },
            examples: {
              test1: {
                value: 123,
              },
            },
          },
        },
      },
      errors: [
        {
          code: 'oas3-valid-media-example',
          message: '"value" property type must be string',
          path: [field, 'xoxo', 'examples', 'test1', 'value'],
        },
      ],
    },
  ]),

  {
    name: 'parameters: will pass when simple example is valid',
    document: {
      openapi: '3.0.0',
      parameters: [
        {
          schema: {
            type: 'string',
          },
          example: 'doggie',
        },
      ],
    },
    errors: [],
  },

  {
    name: 'parameters: will fail when simple example is invalid',
    document: {
      openapi: '3.0.0',
      parameters: [
        {
          schema: {
            type: 'string',
          },
          example: 123,
        },
      ],
    },
    errors: [
      {
        severity: DiagnosticSeverity.Error,
        code: 'oas3-valid-media-example',
        message: '"example" property type must be string',
      },
    ],
  },

  {
    name: 'paramteres: will pass when complex example is used ',
    document: {
      openapi: '3.0.0',
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
          },
          example: {
            url: 'images/38.png',
            width: 100,
            height: 100,
          },
        },
      ],
    },
    errors: [],
  },

  {
    name: 'Ignore required readOnly parameters on requests',
    document: {
      openapi: '3.0.0',
      paths: {
        '/': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    required: ['ro', 'wo'],
                    properties: {
                      ro: {
                        type: 'string',
                        readOnly: true,
                      },
                      wo: {
                        type: 'string',
                        writeOnly: true,
                      },
                      other: {
                        type: 'string',
                      },
                    },
                  },
                  example: {
                    other: 'foobar',
                    wo: 'some',
                  },
                },
              },
            },
          },
        },
      },
      components: {
        requestBodies: {
          foo: {
            content: {
              'application/json': {
                schema: {
                  required: ['ro', 'wo', 'other'],
                  properties: {
                    ro: {
                      type: 'string',
                      readOnly: true,
                    },
                    wo: {
                      type: 'string',
                      writeOnly: true,
                    },
                    other: {
                      type: 'string',
                    },
                  },
                },
                examples: {
                  valid: {
                    summary: 'should be valid',
                    value: {
                      other: 'foo',
                      wo: 'some',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'Ignore required writeOnly parameters on responses',
    document: {
      openapi: '3.0.0',
      paths: {
        '/': {
          post: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: {
                      required: ['ro', 'wo'],
                      properties: {
                        ro: {
                          type: 'string',
                          readOnly: true,
                        },
                        wo: {
                          type: 'string',
                          writeOnly: true,
                        },
                        other: {
                          type: 'string',
                        },
                      },
                    },
                    example: {
                      other: 'foobar',
                      ro: 'some',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        responses: {
          foo: {
            content: {
              'application/json': {
                schema: {
                  required: ['ro', 'wo', 'other'],
                  properties: {
                    ro: {
                      type: 'string',
                      readOnly: true,
                    },
                    wo: {
                      type: 'string',
                      writeOnly: true,
                    },
                    other: {
                      type: 'string',
                    },
                  },
                },
                examples: {
                  valid: {
                    summary: 'should be valid',
                    value: {
                      other: 'foo',
                      ro: 'some',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    errors: [],
  },

  {
    name: 'parameters: will fail when complex example is used',
    document: {
      openapi: '3.0.0',
      parameters: [
        {
          Heh: {
            schema: {
              type: 'number',
            },
            example: 4,
          },
          Abc: {
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
              required: ['abc'],
            },
            example: {
              name: 'Puma',
              id: 1,
            },
          },
        },
      ],
    },
    errors: [
      {
        code: 'oas3-valid-media-example',
        message: '"example" property must have required property "abc"',
        severity: DiagnosticSeverity.Error,
      },
    ],
  },

  {
    name: 'parameters: will error with totally invalid input',
    document: {
      openapi: '3.0.0',
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
          },
          example: {
            url2: 'images/38.png',
            width: 'coffee',
            height: false,
          },
        },
      ],
    },

    errors: [
      {
        code: 'oas3-valid-media-example',
        message: '"example" property must have required property "url"',
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);

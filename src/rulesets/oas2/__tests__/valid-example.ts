import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('valid-example', () => {
  const s = new Spectral();
  s.addRules({
    'valid-example': Object.assign(ruleset.rules['valid-example'], {
      recommended: true,
      type: RuleType[ruleset.rules['valid-example'].type],
    }),
  });

  test('will pass when simple example is valid', async () => {
    const results = await s.run({
      xoxo: {
        type: 'string',
        example: 'doggie',
      },
    });
    expect(results).toHaveLength(0);
  });

  test('will fail when simple example is invalid', async () => {
    const results = await s.run({
      xoxo: {
        type: 'string',
        example: 123,
      },
    });
    expect(results).toHaveLength(1);
  });

  test('will pass when complex example is used ', async () => {
    const results = await s.run({
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
    });

    expect(results).toHaveLength(0);
  });

  test('will error with totally invalid input', async () => {
    const results = await s.run({
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
    });

    expect(results).toHaveLength(1);
  });

  test('works fine with allOf $ref', async () => {
    const results = await s.run({
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
    });

    expect(results).toEqual([
      expect.objectContaining({
        code: 'valid-example',
        message: '"self" property type should be array',
        path: ['definitions', 'halRoot', '_links', 'self'],
      }),
    ]);
  });

  test('will pass for valid parents examples which contain invalid child examples', async () => {
    const results = await s.run({
      swagger: '2.0',
      info: {
        version: '1.0.0',
        title: 'Swagger Petstore',
      },
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
    });

    expect(results).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "valid-example",
          "message": "\\"c\\" property type should be string",
          "path": Array [
            "paths",
            "/pet",
            "post",
            "parameters",
            "0",
            "schema",
            "properties",
            "a",
            "properties",
            "b",
            "properties",
            "c",
          ],
          "range": Object {
            "end": Object {
              "character": 42,
              "line": 37,
            },
            "start": Object {
              "character": 28,
              "line": 35,
            },
          },
          "severity": 1,
          "source": undefined,
          "summary": "\\"c\\" property type should be string",
        },
      ]
    `);
  });

  test('will not fail if an actual property is called example', async () => {
    const results = await s.run({
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
    });

    expect(results).toHaveLength(0);
  });
});

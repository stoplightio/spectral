import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

describe('valid-example-in-definitions', () => {
  const s = new Spectral();

  s.setRules({
    'valid-example-in-definitions': Object.assign(ruleset.rules['valid-example-in-definitions'], {
      recommended: true,
      type: RuleType[ruleset.rules['valid-example-in-definitions'].type],
    }),
  });

  test('will pass when simple example is valid', async () => {
    const results = await s.run({
      definitions: [
        {
          xoxo: {
            type: 'string',
            example: 'doggie',
          },
        },
      ],
    });
    expect(results).toHaveLength(0);
  });

  test('will fail when simple example is invalid', async () => {
    const results = await s.run({
      definitions: [
        {
          xoxo: {
            type: 'string',
            example: 123,
          },
        },
      ],
    });
    expect(results).toEqual([
      expect.objectContaining({
        code: 'valid-example-in-definitions',
        message: '"xoxo.example" property type should be string',
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('will pass when complex example is used ', async () => {
    const results = await s.run({
      definitions: {
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
    });

    expect(results).toHaveLength(0);
  });

  test('will error with totally invalid input', async () => {
    const results = await s.run({
      definitions: {
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
    });

    expect(results).toEqual([
      expect.objectContaining({
        code: 'valid-example-in-definitions',
        message: '"xoxo.example" property should have required property \'url\'',
        severity: DiagnosticSeverity.Error,
      }),
    ]);
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
        severity: DiagnosticSeverity.Error,
        code: 'valid-example-in-definitions',
        message: '"halRoot.example" property type should be array',
        path: ['definitions', 'halRoot', 'example', '_links', 'self'],
      }),
    ]);
  });

  test('will pass for valid parents examples which contain invalid child examples', async () => {
    const results = await s.run({
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
    });

    expect(results).toEqual([
      expect.objectContaining({
        code: 'valid-example-in-definitions',
        message: '"c.example" property type should be string',
        path: ['definitions', '0', 'xoxo', 'properties', 'a', 'properties', 'b', 'properties', 'c', 'example'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('will not fail if an actual property is called example', async () => {
    const results = await s.run({
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
    });

    expect(results).toHaveLength(0);
  });

  test('will not fail if an actual property is called example and there is also type/format property', async () => {
    const results = await s.run({
      definitions: {
        xoxo: {
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
      },
    });

    expect(results).toHaveLength(0);
  });
});

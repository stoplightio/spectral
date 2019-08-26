import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

// @oclif/test packages requires @types/mocha, therefore we have 2 packages coming up with similar typings
// TS is confused and prefers the mocha ones, so we need to instrument it to pick up the Jest ones
declare var test: jest.It;

describe('valid-example', () => {
  const s = new Spectral();
  s.setRules({
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
        message: '"halRoot.example" property type should be array',
        path: ['definitions', 'halRoot', 'example', '_links', 'self'],
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

    expect(results).toEqual([
      expect.objectContaining({
        code: 'valid-example',
        message: '"c.example" property type should be string',
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
        range: expect.any(Object),
        severity: DiagnosticSeverity.Warning,
      }),
    ]);
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

  test('does not report example mismatches for unknown AJV formats', async () => {
    const results = await s.run({
      xoxo: {
        type: 'object',
        properties: {
          ip_address: {
            type: 'integer',
            format: 'foo',
            example: 2886989840,
          },
        },
      },
    });

    expect(results).toEqual([]);
  });

  test.each([['byte', '1'], ['int32', 2 ** 31], ['int64', 2 ** 63], ['float', 2 ** 128]])(
    'reports invalid usage of %s format',
    async (format, example) => {
      const results = await s.run({
        xoxo: {
          type: 'object',
          properties: {
            ip_address: {
              type: ['string', 'number'],
              format,
              example,
            },
          },
        },
      });

      expect(results).toEqual([
        expect.objectContaining({
          code: 'valid-example',
          message: `"ip_address.example" property format should match format "${format}"`, // hm, ip_address is likely to be more meaningful no?
        }),
      ]);
    },
  );

  test.each([['byte', 'MTI3'], ['int32', 2 ** 30], ['int64', 2 ** 40], ['float', 2 ** 64], ['double', 2 ** 1028]])(
    'does not report valid usage of %s format',
    async (format, example) => {
      const results = await s.run({
        xoxo: {
          type: 'object',
          properties: {
            ip_address: {
              type: ['string', 'number'],
              format,
              example,
            },
          },
        },
      });

      expect(results).toHaveLength(0);
    },
  );
});

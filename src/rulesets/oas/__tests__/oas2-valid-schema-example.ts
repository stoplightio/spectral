import { DiagnosticSeverity } from '@stoplight/types';
import type { Spectral } from '../../../spectral';
import { createWithRules } from './__helpers__/createWithRules';

describe('oas2-valid-schema-example', () => {
  let s: Spectral;

  beforeEach(async () => {
    s = await createWithRules(['oas2-valid-schema-example']);
  });

  describe.each(['parameters', 'definitions'])('%s', parentField => {
    test.each(['example', 'x-example'])('will pass when %s example is valid', async field => {
      const results = await s.run({
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
      });
      expect(results).toHaveLength(0);
    });

    test('will pass when both examples are valid', async () => {
      const results = await s.run({
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
      });
      expect(results).toHaveLength(0);
    });

    test('will pass when default value is valid', async () => {
      const results = await s.run({
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
      });
      expect(results).toHaveLength(0);
    });

    test('will fail when one of examples is invalid', async () => {
      const results = await s.run({
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
      });
      expect(results).toEqual([
        expect.objectContaining({
          code: 'oas2-valid-schema-example',
          message: '`x-example` property type should be string',
          severity: DiagnosticSeverity.Error,
        }),
      ]);
    });

    test.each(['example', 'x-example'])('will fail when simple %s is invalid', async field => {
      const results = await s.run({
        swagger: '2.0',
        [parentField]: [
          {
            xoxo: {
              type: 'string',
              [field]: 123,
            },
          },
        ],
      });
      expect(results).toEqual([
        expect.objectContaining({
          code: 'oas2-valid-schema-example',
          message: `\`${field}\` property type should be string`,
          severity: DiagnosticSeverity.Error,
        }),
      ]);
    });

    test('will fail when default value is invalid', async () => {
      const results = await s.run({
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
      });
      expect(results).toEqual([
        expect.objectContaining({
          code: 'oas2-valid-schema-example',
          message: '`default` property type should be string',
          severity: DiagnosticSeverity.Error,
        }),
      ]);
    });

    describe.each(['', null, 0, false])('given falsy %s value', value => {
      test.each(['example', 'x-example'])('will validate empty %s value', async field => {
        const results = await s.run({
          swagger: '2.0',
          [parentField]: [
            {
              xoxo: {
                enum: ['a', 'b'],
                [field]: value,
              },
            },
          ],
        });

        expect(results).toEqual([
          expect.objectContaining({
            code: 'oas2-valid-schema-example',
            message: `\`${field}\` property should be equal to one of the allowed values: \`a\`, \`b\``,
            severity: DiagnosticSeverity.Error,
          }),
        ]);
      });
    });

    test('will pass when complex example is used ', async () => {
      const results = await s.run({
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
      });

      expect(results).toHaveLength(0);
    });

    test('will error with totally invalid input', async () => {
      const results = await s.run({
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
      });

      expect(results).toEqual([
        expect.objectContaining({
          code: 'oas2-valid-schema-example',
          message: '`example` property should have required property `url`',
          severity: DiagnosticSeverity.Error,
        }),
      ]);
    });

    test('will not fail if an actual property is called example and there is also type/format property', async () => {
      const results = await s.run({
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
      });

      expect(results).toHaveLength(0);
    });
  });

  describe('definitions', () => {
    test('works fine with allOf $ref', async () => {
      const results = await s.run({
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
      });

      expect(results).toEqual([
        expect.objectContaining({
          severity: DiagnosticSeverity.Error,
          code: 'oas2-valid-schema-example',
          message: '`self` property type should be array',
          path: ['definitions', 'halRoot', 'example', '_links', 'self'],
        }),
      ]);
    });

    test('will fail for valid parents examples which contain invalid child examples', async () => {
      const results = await s.run({
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
      });

      expect(results).toEqual([
        expect.objectContaining({
          code: 'oas2-valid-schema-example',
          message: '`example` property type should be string',
          path: ['definitions', '0', 'xoxo', 'properties', 'a', 'properties', 'b', 'properties', 'c', 'example'],
          range: expect.any(Object),
          severity: DiagnosticSeverity.Error,
        }),
      ]);
    });

    test('will not fail if an actual property is called example', async () => {
      const results = await s.run({
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
      });

      expect(results).toHaveLength(0);
    });
  });
});

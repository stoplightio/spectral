import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

// @oclif/test packages requires @types/mocha, therefore we have 2 packages coming up with similar typings
// TS is confused and prefers the mocha ones, so we need to instrument it to pick up the Jest ones
declare var test: jest.It;

describe('valid-example-in-parameters', () => {
  const s = new Spectral();
  s.setRules({
    'valid-example-in-parameters': Object.assign(ruleset.rules['valid-example-in-parameters'], {
      recommended: true,
      type: RuleType[ruleset.rules['valid-example-in-parameters'].type],
    }),
  });

  test('will pass when simple example is valid', async () => {
    const results = await s.run({
      parameters: [
        {
          in: 'body',
          schema: {
            type: 'string',
            example: 'doggie',
          },
        },
      ],
    });
    expect(results).toHaveLength(0);
  });

  test('will ignore when not in body', async () => {
    const results = await s.run({
      parameters: [
        {
          in: 'query',
          schema: {
            type: 'number',
            example: 'doggie',
          },
        },
      ],
    });
    expect(results).toHaveLength(0);
  });

  test('will fail when simple example is invalid', async () => {
    const results = await s.run({
      parameters: [
        {
          in: 'body',
          schema: {
            type: 'string',
            example: 123,
          },
        },
      ],
    });
    expect(results).toEqual([
      expect.objectContaining({
        code: 'valid-example-in-parameters',
        message: '"schema.example" property type should be string',
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('will pass when complex example is used ', async () => {
    const results = await s.run({
      parameters: [
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
      parameters: [
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
        code: 'valid-example-in-parameters',
        message: '"schema.example" property should have required property \'url\'',
        severity: DiagnosticSeverity.Error,
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
        code: 'valid-example-in-parameters',
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
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('will not fail if an actual property is called example', async () => {
    const results = await s.run({
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
    });

    expect(results).toHaveLength(0);
  });

  test('will not fail if an actual property is called example and there is also type/format property', async () => {
    const results = await s.run({
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
    });

    expect(results).toHaveLength(0);
  });

  test('does not report example mismatches for unknown AJV formats', async () => {
    const results = await s.run({
      parameters: [
        {
          in: 'body',
          scheme: {
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
      ],
    });

    expect(results).toEqual([]);
  });

  test.each([['byte', '1'], ['int32', 2 ** 31], ['int64', 2 ** 63], ['float', 2 ** 128]])(
    'reports invalid usage of %s format',
    async (format, example) => {
      const results = await s.run({
        parameters: [
          {
            in: 'body',
            scheme: {
              type: 'object',
              properties: {
                ip_address: {
                  type: ['string', 'number'],
                  format,
                  example,
                },
              },
            },
          },
        ],
      });

      expect(results).toEqual([
        expect.objectContaining({
          code: 'valid-example-in-parameters',
          message: `"ip_address.example" property format should match format "${format}"`, // hm, ip_address is likely to be more meaningful no?
        }),
      ]);
    },
  );

  test.each([['byte', 'MTI3'], ['int32', 2 ** 30], ['int64', 2 ** 40], ['float', 2 ** 64], ['double', 2 ** 1028]])(
    'does not report valid usage of %s format',
    async (format, example) => {
      const results = await s.run({
        parameters: [
          {
            type: 'object',
            properties: {
              ip_address: {
                type: ['string', 'number'],
                format,
                example,
              },
            },
          },
        ],
      });

      expect(results).toHaveLength(0);
    },
  );
});

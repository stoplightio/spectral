import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

// @oclif/test packages requires @types/mocha, therefore we have 2 packages coming up with similar typings
// TS is confused and prefers the mocha ones, so we need to instrument it to pick up the Jest ones
declare var test: jest.It;

describe('valid-oas-example-in-parameters', () => {
  const s = new Spectral();

  s.setRules({
    'valid-oas-example-in-parameters': Object.assign(ruleset.rules['valid-oas-example-in-parameters'], {
      recommended: true,
      type: RuleType[ruleset.rules['valid-oas-example-in-parameters'].type],
    }),
  });

  test('will pass when simple example is valid', async () => {
    const results = await s.run({
      parameters: [
        {
          schema: {
            type: 'string',
          },
          example: 'doggie',
        },
      ],
    });
    expect(results).toHaveLength(0);
  });

  test('will fail when simple example is invalid', async () => {
    const results = await s.run({
      parameters: [
        {
          schema: {
            type: 'string',
          },
          example: 123,
        },
      ],
    });
    expect(results).toEqual([
      expect.objectContaining({
        severity: DiagnosticSeverity.Error,
        code: 'valid-oas-example-in-parameters',
        message: '"0.example" property type should be string',
      }),
    ]);
  });

  test('will pass when complex example is used ', async () => {
    const results = await s.run({
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
    });

    expect(results).toHaveLength(0);
  });

  test('will fail when complex example is used', async () => {
    const data = {
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
    };

    const results = await s.run(data);

    expect(results).toEqual([
      expect.objectContaining({
        code: 'valid-oas-example-in-parameters',
        message: '"Abc.example" property should have required property \'abc\'',
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('will error with totally invalid input', async () => {
    const results = await s.run({
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
    });

    expect(results).toEqual([
      expect.objectContaining({
        code: 'valid-oas-example-in-parameters',
        message: '"0.example" property should have required property \'url\'',
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('does not report example mismatches for unknown AJV formats', async () => {
    const results = await s.run({
      parameters: [
        {
          schema: {
            type: 'integer',
            format: 'foo',
            properties: {
              ip_address: {
                type: 'integer',
              },
            },
          },
          example: 2886989840,
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
            schema: {
              type: ['string', 'number'],
              format,
              properties: {
                ip_address: {
                  type: 'string',
                },
              },
            },
            example,
          },
        ],
      });

      expect(results).toEqual([
        expect.objectContaining({
          severity: DiagnosticSeverity.Error,
          code: 'valid-oas-example-in-parameters',
          message: `"0.example" property format should match format "${format}"`, // hm, ip_address is likely to be more meaningful no?
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
            schema: {
              type: ['string', 'number'],
              format,
              example,
              properties: {
                ip_address: {
                  type: 'string',
                },
              },
            },
          },
        ],
      });

      expect(results).toHaveLength(0);
    },
  );
});

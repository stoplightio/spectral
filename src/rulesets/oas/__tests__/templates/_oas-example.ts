import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../../spectral';
import { rules } from '../../index.json';

export default (ruleName: string, path: string) => {
  const s = new Spectral();
  s.registerFormat('oas3', () => true);
  s.setRules({
    [ruleName]: Object.assign(rules[ruleName], {
      recommended: true,
      type: RuleType[rules[ruleName].type],
    }),
  });

  test('will pass when simple example is valid', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      [path]: {
        xoxo: {
          schema: {
            type: 'string',
          },
          example: 'doggie',
        },
      },
    });
    expect(results).toHaveLength(0);
  });

  test('will fail when simple example is invalid', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      [path]: {
        xoxo: {
          schema: {
            type: 'string',
          },
          example: 123,
        },
      },
    });
    expect(results).toEqual([
      expect.objectContaining({
        severity: DiagnosticSeverity.Error,
        code: ruleName,
        message: '"example" property type should be string',
      }),
    ]);
  });

  test('will pass when complex example is used ', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      [path]: {
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
    });

    expect(results).toHaveLength(0);
  });

  test('will fail when complex example is used ', async () => {
    const data = {
      openapi: '3.0.0',
      [path]: {
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
    };

    const results = await s.run(data);

    expect(results).toHaveLength(0);
  });

  test('will error with totally invalid input', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      [path]: {
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
    });

    expect(results).toEqual([
      expect.objectContaining({
        code: ruleName,
        message: `"example" property should have required property 'url'`,
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('does not report example mismatches for unknown AJV formats', async () => {
    const results = await s.run({
      openapi: '3.0.0',
      [path]: {
        xoxo: {
          schema: {
            type: 'string',
            format: 'foo',
          },
          example: 'abc',
        },
      },
    });

    expect(results).toEqual([]);
  });

  test.each([
    ['byte', '1'],
    ['int32', 2 ** 31],
    ['int64', 2 ** 63],
    ['float', 2 ** 128],
  ])('reports invalid usage of %s format', async (format, example) => {
    const results = await s.run({
      openapi: '3.0.0',
      [path]: {
        xoxo: {
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
      },
    });

    expect(results).toEqual([
      expect.objectContaining({
        severity: DiagnosticSeverity.Error,
        code: ruleName,
        message: `"example" property format should match format "${format}"`,
      }),
    ]);
  });

  test.each([
    ['byte', 'MTI3'],
    ['int32', 2 ** 30],
    ['int64', 2 ** 40],
    ['float', 2 ** 64],
    ['double', 2 ** 1028],
  ])('does not report valid usage of %s format', async (format, example) => {
    const results = await s.run({
      openapi: '3.0.0',
      [path]: {
        xoxo: {
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
      },
    });

    expect(results).toHaveLength(0);
  });
};

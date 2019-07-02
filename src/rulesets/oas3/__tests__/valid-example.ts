import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

// @oclif/test packages requires @types/mocha, therefore we have 2 packages coming up with similar typings
// TS is confused and prefers the mocha ones, so we need to instrument it to pick up the Jest ones
declare var test: jest.It;

describe('valid-example', () => {
  const s = new Spectral();
  s.addRules({
    'valid-example': Object.assign(ruleset.rules['valid-example'], {
      enabled: true,
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

  test('will error with totally invalid input', async () => {
    const results = await s.run({
      openapi: '3.0.1',
      info: {
        title: 'OpenAPI Petstore',
        version: '1.0.0',
      },
      paths: {
        '/pet': {
          post: {
            requestBody: {
              content: {
                '*/*': {
                  schema: {
                    type: 'string',
                    format: 'email',
                    example: 'hello',
                  },
                },
              },
              required: true,
            },
            responses: {
              '405': {
                description: 'Invalid input',
                content: {},
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
          "message": "\\"schema\\" property format should match format \\"email\\"",
          "path": Array [
            "paths",
            "/pet",
            "post",
            "requestBody",
            "content",
            "*/*",
            "schema",
          ],
          "range": Object {
            "end": Object {
              "character": 34,
              "line": 15,
            },
            "start": Object {
              "character": 23,
              "line": 12,
            },
          },
          "severity": 1,
          "source": undefined,
          "summary": "\\"schema\\" property format should match format \\"email\\"",
        },
      ]
    `);
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
          message: `"ip_address" property format should match format "${format}"`,
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

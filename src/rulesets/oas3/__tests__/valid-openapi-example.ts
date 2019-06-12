import { RuleType, Spectral } from '../../../spectral';
import * as oas3Ruleset from '../ruleset.json';

declare var test: jest.It;

describe('valid-openapi-example', () => {
  const s = new Spectral();

  s.addRules({
    'valid-openapi-example': Object.assign(oas3Ruleset.rules['valid-openapi-example'], {
      enabled: true,
      type: RuleType[oas3Ruleset.rules['valid-openapi-example'].type],
    }),
  });

  test('errors with totally invalid input', async () => {
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
          "code": "valid-openapi-example",
          "message": "\\"schema\\" property should match format \\"email\\"",
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
          "summary": "\\"schema\\" property should match format \\"email\\"",
        },
      ]
    `);
  });

  describe('when example is not of schema.type', () => {
    test('reports example field validation issue', async () => {
      const results = await s.run({
        xoxo: {
          schema: {
            type: 'string',
            example: 1234,
          },
        },
      });

      expect(results).toEqual([
        expect.objectContaining({
          code: 'valid-openapi-example',
          message: '"schema" property should be string',
        }),
      ]);
    });
  });

  describe('when example is of schema.type', () => {
    test('does not return validation issues', async () => {
      const results = await s.run({
        xoxo: {
          schema: {
            type: 'string',
            example: 'abc',
          },
        },
      });

      expect(results).toHaveLength(0);
    });
  });
});

import { Spectral } from '../../../spectral';
import { oas3Rules } from '../index';

const ruleset = { rules: oas3Rules() };

describe('valid-example', () => {
  const s = new Spectral();
  s.addRules({
    'valid-example': Object.assign(ruleset.rules['valid-example'], {
      enabled: true,
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
    "message": "should match format \\"email\\"",
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
    "summary": "Examples must be valid against their defined schema.",
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

  test('does report invalid int64', async () => {
    const results = await s.run({
      xoxo: {
        type: 'object',
        properties: {
          ip_address: {
            type: 'integer',
            format: 'int64',
            example: Number.MAX_VALUE,
          },
        },
      },
    });

    expect(results).toEqual([
      expect.objectContaining({
        code: 'valid-example',
        message: 'should match format "int64"',
      }),
    ]);
  });
});

import { Spectral } from '../../../spectral';
import { oas2Rules } from '../index';

const ruleset = { rules: oas2Rules() };

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
    expect(results.results).toHaveLength(0);
  });

  test('will fail when simple example is invalid', async () => {
    const results = await s.run({
      xoxo: {
        type: 'string',
        example: 123,
      },
    });
    expect(results.results).toHaveLength(1);
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

    expect(results.results).toHaveLength(0);
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

    expect(results.results).toHaveLength(1);
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

    expect(results.results).toMatchInlineSnapshot(`
Array [
  Object {
    "message": "should be string",
    "name": "valid-example",
    "path": Array [
      "paths",
      "/pet",
      "post",
      "parameters",
      0,
      "schema",
      "properties",
      "a",
      "properties",
      "b",
      "properties",
      "c",
    ],
    "severity": 40,
    "severityLabel": "warn",
    "summary": "Examples must be valid against their defined schema.",
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

    expect(results.results).toHaveLength(0);
  });
});

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

  test('will pass when simple example is valid', () => {
    const results = s.run({
      xoxo: {
        type: 'string',
        example: 'doggie',
      },
    });
    expect(results.results).toHaveLength(0);
  });

  test('will fail when simple example is invalid', () => {
    const results = s.run({
      xoxo: {
        type: 'string',
        example: 123,
      },
    });
    expect(results.results).toHaveLength(1);
  });

  test('will pass when complex example is used ', () => {
    const results = s.run({
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

  test('will error with totally invalid input', () => {
    const results = s.run({
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

  test('will error with totally invalid input', () => {
    const results = s.run({
      swagger: '2.0',
      info: {
        version: '1.0.0',
        title: 'Swagger Petstore',
      },
      host: 'petstore.swagger.io',
      paths: {
        '/pet': {
          post: {
            parameters: [
              {
                in: 'body',
                name: 'body',
                required: true,
                schema: {
                  type: 'string',
                  format: 'email',
                  example: 'hello',
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
    "message": "should match format \\"email\\"",
    "name": "valid-example",
    "path": Array [
      "paths",
      "/pet",
      "post",
      "parameters",
      0,
      "schema",
    ],
    "severity": 40,
    "severityLabel": "warn",
    "summary": "Examples must be valid against their defined schema.",
  },
]
`);
  });
});

import { DiagnosticSeverity } from '@stoplight/types';
import { RuleType, Spectral } from '../../../spectral';
import * as ruleset from '../index.json';

// @oclif/test packages requires @types/mocha, therefore we have 2 packages coming up with similar typings
// TS is confused and prefers the mocha ones, so we need to instrument it to pick up the Jest ones
declare var test: jest.It;

describe('valid-example', () => {
  const s = new Spectral();

  s.addRules({
    'valid-schema-example-in-headers': Object.assign(ruleset.rules['valid-schema-example-in-headers'], {
      recommended: true,
      type: RuleType[ruleset.rules['valid-schema-example-in-headers'].type],
    }),
  });

  s.addRules({
    'valid-oas-example-in-headers': Object.assign(ruleset.rules['valid-oas-example-in-headers'], {
      recommended: true,
      type: RuleType[ruleset.rules['valid-oas-example-in-headers'].type],
    }),
  });

  s.addRules({
    'valid-oas-example-in-parameters': Object.assign(ruleset.rules['valid-oas-example-in-parameters'], {
      recommended: true,
      type: RuleType[ruleset.rules['valid-oas-example-in-parameters'].type],
    }),
  });

  s.addRules({
    'valid-example-in-schemas': Object.assign(ruleset.rules['valid-example-in-schemas'], {
      recommended: true,
      type: RuleType[ruleset.rules['valid-example-in-schemas'].type],
    }),
  });

  s.addRules({
    'valid-schema-example-in-content': Object.assign(ruleset.rules['valid-schema-example-in-content'], {
      recommended: true,
      type: RuleType[ruleset.rules['valid-schema-example-in-content'].type],
    }),
  });

  s.addRules({
    'valid-oas-example-in-content': Object.assign(ruleset.rules['valid-oas-example-in-content'], {
      recommended: true,
      type: RuleType[ruleset.rules['valid-oas-example-in-content'].type],
    }),
  });

  s.addRules({
    'valid-schema-example-in-parameters': Object.assign(ruleset.rules['valid-schema-example-in-parameters'], {
      recommended: true,
      type: RuleType[ruleset.rules['valid-schema-example-in-parameters'].type],
    }),
  });

  test('will pass when simple example is valid', async () => {
    const results = await s.run({
      parameters: [
        {
          schema: {
            type: 'string',
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
          schema: {
            type: 'string',
            example: 123,
          },
        },
      ],
    });
    expect(results).toEqual([
      expect.objectContaining({
        severity: DiagnosticSeverity.Error,
        code: 'valid-schema-example-in-parameters',
        message: '"schema.example" property type should be string',
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

  test('will fail when complex example is used ', async () => {
    const data = {
      components: {
        schemas: {
          Heh: {
            type: 'number',
            example: 4,
          },
          Abc: {
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
            example: {
              name: 'Puma',
              id: 1,
            },
          },
        },
      },
    };

    const results = await s.run(data);

    expect(results).toEqual([
      expect.objectContaining({
        code: 'valid-example-in-schemas',
        message: '"abc.example" property type should be number',
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
        code: 'valid-schema-example-in-parameters',
        message: '"schema.example" property should have required property \'url\'',
        severity: DiagnosticSeverity.Error,
      }),
    ]);
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

    expect(results).toEqual([
      expect.objectContaining({
        code: 'valid-schema-example-in-content',
        message: '"schema.example" property format should match format "email"',
        path: ['paths', '/pet', 'post', 'requestBody', 'content', '*/*', 'schema', 'example'],
        range: expect.any(Object),
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });

  test('does not report example mismatches for unknown AJV formats', async () => {
    const results = await s.run({
      parameters: [
        {
          schema: {
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
            schema: {
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
          severity: DiagnosticSeverity.Error,
          code: 'valid-schema-example-in-parameters',
          message: `"ip_address.example" property format should match format "${format}"`, // hm, ip_address is likely to be more meaningful no?
        }),
      ]);
    },
  );

  test('headers', async () => {
    const data = {
      headers: {
        ble: {
          schema: {
            type: 'number',
          },
          example: 'abc',
          required: false,
        },
        abc: {
          schema: {
            type: 'string',
            example: 'abc',
          },
        },
      },
    };

    const results = await s.run(data);

    expect(results).toEqual([
      {
        severity: DiagnosticSeverity.Error,
        code: 'valid-oas-example-in-headers',
        message: '"ble.example" property type should be number',
        path: ['headers', 'ble', 'example'],
        range: {
          end: {
            character: 22,
            line: 6,
          },
          start: {
            character: 17,
            line: 6,
          },
        },
      },
    ]);
  });

  test('oas-parameters', async () => {
    const data = {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'Swagger Petstore',
        description: 'Swagger Petstore',
        license: {
          name: 'MIT',
        },
        contact: {
          name: 'Test',
        },
      },
      servers: [
        {
          url: 'http://petstore.swagger.io/v1',
        },
      ],
      paths: {
        '/pets': {
          get: {
            summary: 'Info for a specific pet',
            description: 'pets',
            operationId: 'showPetById',
            tags: ['pets'],
            parameters: [
              {
                in: 'query',
                name: 'petId',
                required: true,
                description: 'The id of the pet to retrieve',
                schema: {
                  type: 'integer',
                },
                example: '3',
              },
            ],
            responses: {
              '200': {
                description: 'Expected response to a valid request',
              },
            },
          },
        },
      },
    };

    const results = await s.run(data);

    expect(results).toEqual([
      {
        code: 'valid-oas-example-in-parameters',
        message: '"0.example" property type should be integer',
        path: ['paths', '/pets', 'get', 'parameters', '0', 'example'],
        range: {
          end: {
            character: 26,
            line: 36,
          },
          start: {
            character: 23,
            line: 36,
          },
        },
        severity: DiagnosticSeverity.Error,
      },
    ]);
  });

  test.each([['byte', 'MTI3'], ['int32', 2 ** 30], ['int64', 2 ** 40], ['float', 2 ** 64], ['double', 2 ** 1028]])(
    'does not report valid usage of %s format',
    async (format, example) => {
      const results = await s.run({
        parameters: [
          {
            schema: {
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

      expect(results).toHaveLength(0);
    },
  );
});

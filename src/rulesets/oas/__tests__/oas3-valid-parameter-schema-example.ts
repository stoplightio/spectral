import { DiagnosticSeverity } from '@stoplight/types';
import { functions } from '../../../functions';
import { RuleType, Spectral } from '../../../spectral';
import { setFunctionContext } from '../../evaluators';
import validSchemaPrimitiveExample from '../functions/validSchemaPrimitiveExample';
import * as ruleset from '../index.json';

describe('oas3-valid-parameter-schema-example', () => {
  let s: Spectral;

  beforeEach(() => {
    s = new Spectral();
    s.registerFormat('oas3', () => true);
    s.setRules({
      'oas3-valid-parameter-schema-example': Object.assign(ruleset.rules['oas3-valid-parameter-schema-example'], {
        recommended: true,
        type: RuleType[ruleset.rules['oas3-valid-parameter-schema-example'].type],
      }),
    });
    s.setFunctions({
      validSchemaPrimitiveExample: setFunctionContext({ functions }, validSchemaPrimitiveExample),
    });
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
        code: 'oas3-valid-parameter-schema-example',
        message: '`example` property type should be string',
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
        code: 'oas3-valid-parameter-schema-example',
        message: '`example` property type should be string',
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

  test('will fail when complex example is used', async () => {
    const data = {
      parameters: [
        {
          Heh: {
            schema: {
              type: 'number',
              example: 4,
            },
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
              required: ['name'],
              example: {
                name: 'Puma',
                id: 1,
              },
            },
          },
        },
      ],
    };

    const results = await s.run(data);

    expect(results).toEqual([
      expect.objectContaining({
        code: 'oas3-valid-parameter-schema-example',
        message: '`example` property type should be number',
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
        code: 'oas3-valid-parameter-schema-example',
        message: 'Object should have required property `url`',
        severity: DiagnosticSeverity.Error,
      }),
    ]);
  });
});

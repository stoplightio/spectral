import { oas3, oas3_0 } from '@stoplight/spectral-formats';
import { DeepPartial } from '@stoplight/types';
import oasExample, { Options as ExampleOptions } from '../oasExample';
import { RulesetFunctionContext } from '@stoplight/spectral-core/src';

const schemaOpts: ExampleOptions = {
  schemaField: '$',
  oasVersion: 3,
  type: 'schema',
};
const mediaOpts: ExampleOptions = {
  schemaField: 'schema',
  oasVersion: 3,
  type: 'media',
};
const docFormats = {
  formats: new Set([oas3, oas3_0]),
};

/**
 * Runs the oasExample() custom rule function to perform a single test.
 * @param target the object (media type or schema) containing an example/default value
 * @param ruleOptions the options to be passed to oasExample()
 * @param context the spectral context object to pass to oasExample()
 * @returns an array of errors, or [] if no errors occurred
 */
function runRule(testData: Record<string, unknown>, ruleOptions: ExampleOptions) {
  const context: DeepPartial<RulesetFunctionContext> = {
    path: [],
    documentInventory: {},
    document: docFormats,
  };

  return oasExample(testData, ruleOptions, context as RulesetFunctionContext);
}

describe('oasExample', () => {
  describe('should return no errors', () => {
    describe('example/default value in schema', () => {
      test('valid "example" object', () => {
        const schema = {
          type: 'object',
          properties: {
            foo: {
              type: 'number',
            },
            bar: {
              type: 'string',
            },
          },
          required: ['foo'],
          example: {
            foo: 38,
            bar: 'foo',
          },
        };

        const results = runRule(schema, schemaOpts);
        expect(results).toHaveLength(0);
      });
      test('valid "default" string', () => {
        const schema = {
          type: 'string',
          pattern: 'xyz-.*',
          minLength: 4,
          maxLength: 6,
          default: 'xyz-99',
        };

        const results = runRule(schema, schemaOpts);
        expect(results).toHaveLength(0);
      });
      test('valid "example" integer', () => {
        const schema = {
          type: 'integer',
          example: 74,
        };

        const results = runRule(schema, schemaOpts);
        expect(results).toHaveLength(0);
      });
      test('scenario: "resolves to more than one schema"', () => {
        // This test data is from https://github.com/stoplightio/spectral/issues/2081 and
        // demonstrates a scenario in which ajv returns the dreaded
        // "reference <...> resolves to more than one schema" false error.
        // Without the fix to the oasExample() function, this test will fail.
        // The reason that it fails is due to the way in which ajv handles unknown
        // properties found in the schema (e.g. "example" - it's not actually part of JSONSchema),
        // and the way it gives special treatment to the "id" property. Ajv gets confused by
        // the fact that there are multiple example objects that each contain a property named "id"
        // with the value 'bf23bc970b78d27691e8' (repeating example values is probably not an uncommon
        // use-case for openapi authors if you think about it).
        // So, without the fix to oasExample(), the test below will fail with this result:
        // [
        //   {
        //     "message": "reference \"bf23bc970b78d27691e8\" resolves to more than one schema",
        //     "path": ["example"]
        //   }
        // ]
        // However, if you rename the "id" properties to something else, the rule returns [].
        // Likewise, if you change the value of "id" in one of the examples (so they are no longer equal)
        // the rule returns [].
        // And of course, with the fix to oasExample() in place, the rule will also return [].
        const schema = {
          type: 'object',
          required: ['items'],
          allOf: [
            {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['id', 'url'],
                    properties: {
                      id: {
                        type: 'string',
                      },
                      url: {
                        type: 'string',
                        format: 'uri',
                      },
                    },
                    example: {
                      id: 'bf23bc970b78d27691e8',
                      url: 'https://api.example.com/banking/accounts/bf23bc970b78d27691e8',
                    },
                  },
                },
              },
            },
          ],
          example: {
            items: [
              {
                id: 'bf23bc970b78d27691e8',
                url: 'https://api.example.com/banking/accounts/bf23bc970b78d27691e8',
              },
              {
                id: '8d27691e8bf23bc970b7',
                url: 'https://api.example.com/banking/accounts/8d27691e8bf23bc970b7',
              },
            ],
          },
        };

        const results = runRule(schema, schemaOpts);
        expect(results).toHaveLength(0);
      });
    });
    describe('example/examples value in mediatype', () => {
      test('valid "example" object', () => {
        const mediaType = {
          schema: {
            type: 'object',
            properties: {
              foo: {
                type: 'number',
              },
              bar: {
                type: 'string',
              },
            },
            required: ['foo'],
          },
          example: {
            foo: 38,
            bar: 'foo',
          },
        };

        const results = runRule(mediaType, mediaOpts);
        expect(results).toHaveLength(0);
      });
      test('valid "examples" object', () => {
        const mediaType = {
          schema: {
            type: 'object',
            properties: {
              foo: {
                type: 'number',
              },
              bar: {
                type: 'string',
              },
            },
            required: ['foo'],
          },
          examples: {
            first: {
              value: {
                foo: 38,
                bar: 'foo',
              },
            },
            second: {
              value: {
                foo: 26,
                bar: 'baz',
              },
            },
          },
        };

        const results = runRule(mediaType, mediaOpts);
        expect(results).toHaveLength(0);
      });
      test('valid "example" string', () => {
        const mediaType = {
          schema: {
            type: 'string',
            pattern: 'xyz-.*',
            minLength: 4,
            maxLength: 8,
          },
          example: 'xyz-9999',
        };

        const results = runRule(mediaType, mediaOpts);
        expect(results).toHaveLength(0);
      });
      test('valid "examples" string', () => {
        const mediaType = {
          schema: {
            type: 'string',
            pattern: 'id-.*',
            minLength: 4,
            maxLength: 8,
          },
          examples: {
            first: {
              value: 'id-1',
            },
            second: {
              value: 'id-99999',
            },
            third: {
              value: 'id-38',
            },
          },
        };

        const results = runRule(mediaType, mediaOpts);
        expect(results).toHaveLength(0);
      });
      test('scenario: "resolves to more than one schema"', () => {
        // This test data was adapted from https://github.com/stoplightio/spectral/issues/2140.
        const mediaType = {
          schema: {
            properties: {
              bars: {
                description: 'Array of bars!',
                type: 'array',
                items: {
                  oneOf: [
                    {
                      type: 'object',
                      description: 'a real bar!',
                      required: ['id'],
                      properties: {
                        id: {
                          description: 'The ID for this real bar',
                          type: 'string',
                        },
                      },
                      example: {
                        id: '6d353a0f-aeb1-4ae1-832e-1110d10981bb',
                      },
                    },
                    {
                      description: 'not a real bar!',
                      not: {
                        type: 'object',
                        description: 'a real bar!',
                        required: ['id'],
                        properties: {
                          id: {
                            description: 'The ID for this real bar',
                            type: 'string',
                          },
                        },
                        example: {
                          id: '6d353a0f-aeb1-4ae1-832e-1110d10981bb',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          example: {
            bars: [{ id: '6d353a0f-aeb1-4ae1-832e-1110d10981bb' }],
          },
        };

        const results = runRule(mediaType, mediaOpts);
        expect(results).toHaveLength(0);
      });
    });
  });
  describe('should return errors', () => {
    describe('example/default value in schema', () => {
      test('invalid "example" object', () => {
        const schema = {
          type: 'object',
          properties: {
            foo: {
              type: 'number',
            },
            bar: {
              type: 'string',
            },
          },
          required: ['foo', 'bar'],
          example: {
            foo: 38,
            bar: 26,
          },
        };

        const results = runRule(schema, schemaOpts);
        expect(results).toHaveLength(1);

        expect(results[0].path.join('.')).toBe('example.bar');
        expect(results[0].message).toBe(`"bar" property type must be string`);
      });
      test('invalid "default" string', () => {
        const schema = {
          type: 'string',
          pattern: 'xyz-.*',
          minLength: 4,
          maxLength: 8,
          default: 'xyz-99999',
        };

        const results = runRule(schema, schemaOpts);
        expect(results).toHaveLength(1);
        expect(results[0].message).toBe(`"default" property must not have more than 8 characters`);
        expect(results[0].path.join('.')).toBe('default');
      });
    });
    describe('example/examples value in mediatype', () => {
      test('invalid "example" object', () => {
        const mediaType = {
          schema: {
            type: 'object',
            properties: {
              foo: {
                type: 'number',
              },
              bar: {
                type: 'string',
              },
            },
            required: ['foo', 'bar'],
          },
          example: {
            foo: 38,
          },
        };

        const results = runRule(mediaType, mediaOpts);
        expect(results).toHaveLength(1);
        expect(results[0].message).toBe(`"example" property must have required property "bar"`);
        expect(results[0].path.join('.')).toBe('example');
      });
      test('invalid "examples" object', () => {
        const mediaType = {
          schema: {
            type: 'object',
            properties: {
              foo: {
                type: 'number',
              },
              bar: {
                type: 'string',
              },
            },
            required: ['foo', 'bar'],
          },
          examples: {
            first: {
              value: {
                foo: 38,
              },
            },
            second: {
              value: {
                foo: 'bar',
                bar: 'foo',
              },
            },
          },
        };

        const results = runRule(mediaType, mediaOpts);
        expect(results).toHaveLength(2);

        expect(results[0].message).toBe(`"value" property must have required property "bar"`);
        expect(results[0].path.join('.')).toBe('examples.first.value');

        expect(results[1].message).toBe(`"foo" property type must be number`);
        expect(results[1].path.join('.')).toBe('examples.second.value.foo');
      });
      test('invalid "example" string', () => {
        const mediaType = {
          schema: {
            type: 'string',
            pattern: 'xyz-.*',
            minLength: 4,
            maxLength: 8,
          },
          example: 'xyz-99999',
        };

        const results = runRule(mediaType, mediaOpts);
        expect(results).toHaveLength(1);
        expect(results[0].message).toBe(`"example" property must not have more than 8 characters`);
        expect(results[0].path.join('.')).toBe('example');
      });
      test('invalid "examples" string', () => {
        const mediaType = {
          schema: {
            type: 'string',
            pattern: 'xyz-.*',
            minLength: 4,
            maxLength: 8,
            default: 'xyz-99',
          },
          examples: {
            first: {
              value: 'xyz-99999',
            },
            second: {
              value: 38,
            },
          },
        };

        const results = runRule(mediaType, mediaOpts);
        expect(results).toHaveLength(2);
        expect(results[0].message).toBe(`"value" property must not have more than 8 characters`);
        expect(results[0].path.join('.')).toBe('examples.first.value');
        expect(results[1].message).toBe(`"value" property type must be string`);
        expect(results[1].path.join('.')).toBe('examples.second.value');
      });
    });
  });
});

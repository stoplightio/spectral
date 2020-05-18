import { Optional } from '@stoplight/types';
import { JSONSchema4, JSONSchema6 } from 'json-schema';
import { schema } from '../schema';

function runSchema(target: any, schemaObj: object, oasVersion?: Optional<2 | 3 | 3.1>) {
  return schema(target, { schema: schemaObj, oasVersion }, { given: [] }, { given: null, original: null } as any);
}

describe('schema', () => {
  describe('validates falsy values such as', () => {
    test('empty string', () => {
      const testSchema: JSONSchema6 = {
        type: 'number',
      };

      expect(runSchema('', testSchema)).toEqual([
        {
          message: '{{property|gravis|append-property|optional-typeof|capitalize}}type should be number',
          path: [],
        },
      ]);
    });

    test('zero', () => {
      const testSchema: JSONSchema6 = {
        type: 'string',
      };

      expect(runSchema(0, testSchema)).toEqual([
        {
          message: `{{property|gravis|append-property|optional-typeof|capitalize}}type should be string`,
          path: [],
        },
      ]);
    });

    test('false', () => {
      const testSchema: JSONSchema6 = {
        type: 'string',
      };

      expect(runSchema(false, testSchema)).toEqual([
        {
          message: `{{property|gravis|append-property|optional-typeof|capitalize}}type should be string`,
          path: [],
        },
      ]);
    });

    test('null', () => {
      const testSchema: JSONSchema6 = {
        type: 'string',
      };

      expect(runSchema(null, testSchema)).toEqual([
        {
          message: `{{property|gravis|append-property|optional-typeof|capitalize}}type should be string`,
          path: [],
        },
      ]);
    });
  });

  describe('when schema defines unknown format', () => {
    const testSchema = {
      type: 'string',
      format: 'ISO-3166-1 alpha-2',
    };

    beforeEach(() => {
      jest.spyOn(console, 'warn');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('does not log a warning in the console', () => {
      const input = 'some string';
      expect(runSchema(input, testSchema)).toEqual([]);
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('when schema defines a simple array', () => {
    const testSchema = {
      type: 'array',
      items: {
        type: 'string',
      },
      maxItems: 1,
    };

    test('errors with totally invalid input', () => {
      const input = { foo: 'bar' };
      expect(runSchema(input, testSchema)).toEqual([
        expect.objectContaining({
          message: '{{property|gravis|append-property|optional-typeof|capitalize}}type should be array',
          path: [],
        }),
      ]);
    });

    test('errors with subtly invalid input', () => {
      const input = ['1', '2'];
      expect(runSchema(input, testSchema)).toEqual([
        expect.objectContaining({
          message:
            '{{property|gravis|append-property|optional-typeof|capitalize}}maxItems should NOT have more than 1 items',
          path: [],
        }),
      ]);
    });
  });

  describe('when schema defines a nested object', () => {
    const testSchema = {
      type: 'object',
      properties: {
        foo: {
          type: 'object',
          properties: {
            bar: {
              type: 'string',
            },
          },
          additionalProperties: false,
        },
      },
    };

    test('reports correct paths', () => {
      expect(
        runSchema(
          {
            abc: 'string',
            foo: {
              bar: 0,
            },
          },
          testSchema,
        ),
      ).toEqual([
        {
          message: `{{property|gravis|append-property|optional-typeof|capitalize}}type should be string`,
          path: ['foo', 'bar'],
        },
      ]);

      expect(
        runSchema(
          {
            abc: 'string',
            foo: {
              baz: 'test',
            },
          },
          testSchema,
        ),
      ).toEqual([
        {
          message: 'Property `baz` is not expected to be here',
          path: ['foo'],
        },
      ]);
    });
  });

  describe('when schema defines common formats', () => {
    const testSchema = {
      type: 'string',
      format: 'email',
    };

    test('errors for not emails', () => {
      const input = 'not an email';
      expect(runSchema(input, testSchema)).toEqual([
        expect.objectContaining({
          message: '{{property|gravis|append-property|optional-typeof|capitalize}}format should match format `email`',
          path: [],
        }),
      ]);
    });

    test('considers emails valid', () => {
      const input = 'email@example.com';
      expect(runSchema(input, testSchema)).toEqual([]);
    });
  });

  describe('when schema defines OpenAPI specific formats', () => {
    const testSchema = {
      type: 'number',
      format: 'int32',
    };

    test('accepts a number of any format', () => {
      const input = 123;
      expect(runSchema(input, testSchema)).toEqual([]);
    });
  });

  test('handles duplicate JSONSchema Draft 4 ids', () => {
    const testSchema: JSONSchema4 = {
      id: 'test',
      type: 'string',
    };

    const testSchema2: JSONSchema4 = {
      id: 'test',
      type: 'number',
    };

    expect(runSchema(2, testSchema)).toEqual([
      {
        path: [],
        message: `{{property|gravis|append-property|optional-typeof|capitalize}}type should be string`,
      },
    ]);
    expect(runSchema('a', testSchema2)).toEqual([]);
  });

  test('handles duplicate JSONSchema Draft 6 and 7 $ids', () => {
    const testSchema: JSONSchema6 = {
      $id: 'test',
      type: 'string',
    };

    const testSchema2: JSONSchema6 = {
      $id: 'test',
      type: 'number',
    };

    expect(runSchema(2, testSchema)).toEqual([
      {
        path: [],
        message: `{{property|gravis|append-property|optional-typeof|capitalize}}type should be string`,
      },
    ]);
    expect(runSchema('a', testSchema2)).toEqual([]);
  });

  test.each([4, 6, 7])('accepts draft %d', draft => {
    const testSchema: JSONSchema6 = {
      $schema: `http://json-schema.org/draft-0${draft}/schema#`,
      type: 'string',
    };

    expect(runSchema.bind(null, 'd', testSchema)).not.toThrow();
  });

  describe('given a primitive value', () => {
    describe('and an enum consisting of string values', () => {
      const testSchema: JSONSchema6 = {
        $schema: `http://json-schema.org/draft-06/schema#`,
        type: 'string',
        enum: ['foo', 'bar'],
      };

      it('reports pretty enum errors for a string', () => {
        expect(runSchema('baz', testSchema)).toEqual([
          {
            message: `String should be equal to one of the allowed values: foo, bar. Did you mean bar?`,
            path: [],
          },
        ]);
      });

      it('reports pretty enum errors for a number', () => {
        expect(runSchema(2, testSchema)).toEqual([
          {
            message: `{{property|gravis|append-property|optional-typeof|capitalize}}type should be string`,
            path: [],
          },
        ]);
      });
    });

    describe('and an enum consisting of integer values', () => {
      const testSchema: JSONSchema6 = {
        $schema: `http://json-schema.org/draft-06/schema#`,
        type: 'integer',
        enum: [1, 3, 5, 10, 12],
      };

      it('reports pretty enum errors for a string', () => {
        expect(runSchema('baz', testSchema)).toEqual([
          {
            message: '{{property|gravis|append-property|optional-typeof|capitalize}}type should be integer',
            path: [],
          },
        ]);
      });

      it('reports pretty enum errors for a number', () => {
        expect(runSchema(2, testSchema)).toEqual([
          {
            message: `Number should be equal to one of the allowed values: 1, 3, 5, 10, 12`,
            path: [],
          },
        ]);
      });
    });
  });

  test('reports slightly less pretty enum errors for primitive values that are not similar to any values in enum', () => {
    const testSchema: JSONSchema6 = {
      $schema: `http://json-schema.org/draft-06/schema#`,
      type: 'string',
      enum: ['foo', 'bar'],
    };

    expect(runSchema('three', testSchema)).toEqual([
      {
        message: `String should be equal to one of the allowed values: foo, bar`,
        path: [],
      },
    ]);
  });

  test('pretty-prints path-less property', () => {
    const input = { foo: true };
    expect(runSchema(input, { additionalProperties: false })).toEqual([
      expect.objectContaining({
        message: 'Property `foo` is not expected to be here',
        path: [],
      }),
    ]);
  });
});

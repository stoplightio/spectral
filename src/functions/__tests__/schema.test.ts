import { DeepPartial } from '@stoplight/types';
import type { JSONSchema6 as JSONSchema } from 'json-schema';
import { IFunctionValues } from '../../types';
import { schema } from '../schema';

function runSchema(target: any, schemaObj: object, context?: DeepPartial<IFunctionValues>) {
  return schema(target, { schema: schemaObj }, { given: [] }, {
    given: null,
    original: null,
    ...context,
  } as IFunctionValues);
}

describe('schema', () => {
  describe('validates falsy values such as', () => {
    test('empty string', () => {
      const testSchema: JSONSchema = {
        type: 'number',
      };

      expect(runSchema('', testSchema)).toEqual([
        {
          message: 'Value type must be number',
          path: [],
        },
      ]);
    });

    test('zero', () => {
      const testSchema: JSONSchema = {
        type: 'string',
      };

      expect(runSchema(0, testSchema)).toEqual([
        {
          message: `Value type must be string`,
          path: [],
        },
      ]);
    });

    test('false', () => {
      const testSchema: JSONSchema = {
        type: 'string',
      };

      expect(runSchema(false, testSchema)).toEqual([
        {
          message: `Value type must be string`,
          path: [],
        },
      ]);
    });

    test('null', () => {
      const testSchema: JSONSchema = {
        type: 'string',
      };

      expect(runSchema(null, testSchema)).toEqual([
        {
          message: `Value type must be string`,
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
          message: 'Value type must be array',
          path: [],
        }),
      ]);
    });

    test('errors with subtly invalid input', () => {
      const input = ['1', '2'];
      expect(runSchema(input, testSchema)).toEqual([
        expect.objectContaining({
          message: 'Object must not have more than 1 items',
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
          message: '`bar` property type must be string',
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
          message: 'String must match format `email`',
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

  describe('given a primitive value', () => {
    describe('and an enum consisting of string values', () => {
      const testSchema: JSONSchema = {
        $schema: `http://json-schema.org/draft-07/schema#`,
        type: 'string',
        enum: ['foo', 'bar'],
      };

      it('reports pretty enum errors for a string', () => {
        expect(runSchema('baz', testSchema)).toEqual([
          {
            message: 'String must be equal to one of the allowed values: `foo`, `bar`. Did you mean `bar`?',
            path: [],
          },
        ]);
      });

      it('reports pretty enum errors for a number', () => {
        expect(runSchema(2, testSchema)).toEqual([
          {
            message: 'Value type must be string',
            path: [],
          },
        ]);
      });
    });

    describe('and an enum consisting of integer values', () => {
      const testSchema: JSONSchema = {
        $schema: `http://json-schema.org/draft-07/schema#`,
        type: 'integer',
        enum: [1, 3, 5, 10, 12],
      };

      it('reports pretty enum errors for a string', () => {
        expect(runSchema('baz', testSchema)).toEqual([
          {
            message: 'Value type must be integer',
            path: [],
          },
        ]);
      });

      it('reports pretty enum errors for a number', () => {
        expect(runSchema(2, testSchema)).toEqual([
          {
            message: `Number must be equal to one of the allowed values: 1, 3, 5, 10, 12`,
            path: [],
          },
        ]);
      });
    });

    describe('and an enum contains a null', () => {
      const testSchema: JSONSchema = {
        $schema: `http://json-schema.org/draft-07/schema#`,
        enum: [1, null],
      };

      it('reports pretty enum errors for a string', () => {
        expect(runSchema('baz', testSchema)).toEqual([
          {
            message: `String must be equal to one of the allowed values: 1, null`,
            path: [],
          },
        ]);
      });

      it('reports pretty enum errors for a number', () => {
        expect(runSchema(2, testSchema)).toEqual([
          {
            message: `Number must be equal to one of the allowed values: 1, null`,
            path: [],
          },
        ]);
      });
    });
  });

  test('reports slightly less pretty enum errors for primitive values that are not similar to any values in enum', () => {
    const testSchema: JSONSchema = {
      $schema: `http://json-schema.org/draft-07/schema#`,
      type: 'string',
      enum: ['foo', 'bar'],
    };

    expect(runSchema('three', testSchema)).toEqual([
      {
        message: 'String must be equal to one of the allowed values: `foo`, `bar`',
        path: [],
      },
    ]);
  });

  test('pretty-prints path-less property', () => {
    const input = { foo: true };
    expect(runSchema(input, { additionalProperties: false })).toEqual([
      {
        message: 'Property `foo` is not expected to be here',
        path: [],
      },
    ]);
  });

  describe('when schema has a $ref left', () => {
    test('given unresolved context, reports an error', () => {
      expect(runSchema({}, { $ref: '#/foo' }, { rule: { resolved: false } })).toEqual([
        {
          message: "can't resolve reference #/foo from id #",
          path: [],
        },
      ]);
    });

    test('given resolved context, ignores', () => {
      expect(runSchema({}, { $ref: '#/bar' }, { rule: { resolved: true } })).toEqual([]);
    });
  });
});

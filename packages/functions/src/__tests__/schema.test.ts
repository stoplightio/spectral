import type { JSONSchema6 as JSONSchema } from 'json-schema';
import schema from '../schema';
import { RulesetValidationError } from '@stoplight/spectral-core';
import testFunction from './__helpers__/tester';

const runSchema = testFunction.bind(null, schema);

describe('Core Functions / Schema', () => {
  it('validates draft 4', async () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: 'number',
      maximum: 2,
      exclusiveMaximum: true,
    };

    const result = await runSchema(2, { schema });
    expect(result).toStrictEqual([
      {
        message: 'Number must be < 2',
        path: [],
      },
    ]);

    expect(await runSchema(2, { schema, dialect: 'auto' })).toStrictEqual(result);
  });

  it('validates draft 6', async () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-06/schema#',
      type: 'string',
    };

    const result = await runSchema(2, { schema });
    expect(result).toEqual([
      {
        message: 'Value type must be string',
        path: [],
      },
    ]);

    expect(await runSchema(2, { schema, dialect: 'auto' })).toStrictEqual(result);
  });

  describe('validates falsy values such as', () => {
    it('empty string', async () => {
      const schema: JSONSchema = {
        type: 'number',
      };

      expect(await runSchema('', { schema })).toEqual([
        {
          message: 'Value type must be number',
          path: [],
        },
      ]);
    });

    it('zero', async () => {
      const schema: JSONSchema = {
        type: 'string',
      };

      expect(await runSchema(0, { schema })).toEqual([
        {
          message: `Value type must be string`,
          path: [],
        },
      ]);
    });

    it('false', async () => {
      const schema: JSONSchema = {
        type: 'string',
      };

      expect(await runSchema(false, { schema })).toEqual([
        {
          message: `Value type must be string`,
          path: [],
        },
      ]);
    });

    it('null', async () => {
      const schema: JSONSchema = {
        type: 'string',
      };

      expect(await runSchema(null, { schema })).toEqual([
        {
          message: `Value type must be string`,
          path: [],
        },
      ]);
    });
  });

  describe('when schema defines unknown format', () => {
    let warnSpy: jest.SpyInstance;

    const schema = {
      type: 'string',
      format: 'ISO-3166-1 alpha-2',
    };

    beforeEach(() => {
      warnSpy = jest.spyOn(console, 'warn');
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('does not log a warning in the console', async () => {
      const input = 'some string';
      expect(await runSchema(input, { schema })).toEqual([]);
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('when schema defines a simple array', () => {
    const schema = {
      type: 'array',
      items: {
        type: 'string',
      },
      maxItems: 1,
    };

    it('errors with totally invalid input', async () => {
      const input = { foo: 'bar' };
      expect(await runSchema(input, { schema })).toEqual([
        {
          message: 'Value type must be array',
          path: [],
        },
      ]);
    });

    it('errors with subtly invalid input', async () => {
      const input = ['1', '2'];
      expect(await runSchema(input, { schema })).toEqual([
        {
          message: 'Object must not have more than 1 items',
          path: [],
        },
      ]);
    });
  });

  describe('when schema defines a nested object', () => {
    const schema = {
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

    it('reports correct paths', async () => {
      expect(
        await runSchema(
          {
            abc: 'string',
            foo: {
              bar: 0,
            },
          },
          { schema },
        ),
      ).toEqual([
        {
          message: '"bar" property type must be string',
          path: ['foo', 'bar'],
        },
      ]);

      expect(
        await runSchema(
          {
            abc: 'string',
            foo: {
              baz: 'test',
            },
          },
          { schema },
        ),
      ).toEqual([
        {
          message: 'Property "baz" is not expected to be here',
          path: ['foo'],
        },
      ]);
    });
  });

  describe('when schema defines common formats', () => {
    const schema = {
      type: 'string',
      format: 'email',
    };

    it('errors for not emails', async () => {
      const input = 'not an email';
      expect(await runSchema(input, { schema })).toEqual([
        {
          message: 'String must match format "email"',
          path: [],
        },
      ]);
    });

    it('considers emails valid', async () => {
      const input = 'email@example.com';
      expect(await runSchema(input, { schema })).toEqual([]);
    });
  });

  describe('when schema defines OpenAPI specific formats', () => {
    const schema = {
      type: 'number',
      format: 'int32',
    };

    it('accepts a number of any format', async () => {
      const input = 123;
      expect(await runSchema(input, { schema })).toEqual([]);
    });

    it.each([
      ['byte', '3'],
      ['int32', 2 ** 40],
    ])('reports invalid usage of %s format', async (format, input) => {
      const results = await runSchema(input, {
        schema: {
          type: ['string', 'number'],
          format,
        },
      });

      expect(results).toEqual([
        {
          path: [],
          message: expect.stringMatching(new RegExp(`^(Number|String|Value) must match format "${format}"$`)),
        },
      ]);
    });

    it.each([
      ['byte', 'MIT3'],
      ['int32', 2 ** 30],
      ['int64', 2 ** 40],
    ])('does not report valid usage of %s format', async (format, input) => {
      const results = await runSchema(input, {
        schema: {
          type: ['string', 'number'],
          format,
        },
      });

      expect(results).toHaveLength(0);
    });
  });

  describe('given a primitive value', () => {
    describe('and an enum consisting of string values', () => {
      const schema: JSONSchema = {
        $schema: `http://json-schema.org/draft-07/schema#`,
        type: 'string',
        enum: ['foo', 'bar'],
      };

      it('reports pretty enum errors for a string', async () => {
        expect(await runSchema('baz', { schema })).toEqual([
          {
            message: 'String must be equal to one of the allowed values: "foo", "bar". Did you mean "bar"?',
            path: [],
          },
        ]);
      });

      it('reports pretty enum errors for a number', async () => {
        expect(await runSchema(2, { schema })).toEqual([
          {
            message: 'Value type must be string',
            path: [],
          },
        ]);
      });
    });

    describe('and an enum consisting of integer values', () => {
      const schema: JSONSchema = {
        $schema: `http://json-schema.org/draft-07/schema#`,
        type: 'integer',
        enum: [1, 3, 5, 10, 12],
      };

      it('reports pretty enum errors for a string', async () => {
        expect(await runSchema('baz', { schema })).toEqual([
          {
            message: 'Value type must be integer',
            path: [],
          },
        ]);
      });

      it('reports pretty enum errors for a number', async () => {
        expect(await runSchema(2, { schema })).toEqual([
          {
            message: `Number must be equal to one of the allowed values: 1, 3, 5, 10, 12`,
            path: [],
          },
        ]);
      });
    });

    describe('and an enum contains a null', () => {
      const schema: JSONSchema = {
        $schema: `http://json-schema.org/draft-07/schema#`,
        enum: [1, null],
      };

      it('reports pretty enum errors for a string', async () => {
        expect(await runSchema('baz', { schema })).toEqual([
          {
            message: `String must be equal to one of the allowed values: 1, null`,
            path: [],
          },
        ]);
      });

      it('reports pretty enum errors for a number', async () => {
        expect(await runSchema(2, { schema })).toEqual([
          {
            message: `Number must be equal to one of the allowed values: 1, null`,
            path: [],
          },
        ]);
      });
    });
  });

  it('reports slightly less pretty enum errors for primitive values that are not similar to any values in enum', async () => {
    const schema: JSONSchema = {
      $schema: `http://json-schema.org/draft-07/schema#`,
      type: 'string',
      enum: ['foo', 'bar'],
    };

    expect(await runSchema('three', { schema })).toEqual([
      {
        message: 'String must be equal to one of the allowed values: "foo", "bar"',
        path: [],
      },
    ]);
  });

  it('pretty-prints path-less property', async () => {
    const input = { foo: true };
    expect(await runSchema(input, { schema: { additionalProperties: false } })).toEqual([
      {
        message: 'Property "foo" is not expected to be here',
        path: [],
      },
    ]);
  });

  describe('when schema has a $ref left', () => {
    it('given unresolved context, reports an error', async () => {
      expect(await runSchema({}, { schema: { $ref: '#/foo' } }, { resolved: false })).toEqual([
        {
          message: "can't resolve reference #/foo from id #",
          path: [],
        },
      ]);
    });

    it('given resolved context, ignores', async () => {
      expect(await runSchema({}, { schema: { $ref: '#/bar' } }, { resolved: true })).toEqual([]);
    });
  });

  describe('validation', () => {
    it.each([
      { schema: { type: 'object' } },
      { schema: { type: 'string' }, dialect: 'auto' },
      { schema: { type: 'string' }, allErrors: true },
      { schema: { type: 'string' }, dialect: 'draft2019-09', allErrors: false },
      {
        schema: { type: 'string' },
        dialect: 'draft2019-09',
        prepareResults() {
          /* no-op */
        },
      },
    ])('given valid %p options, should not throw', async opts => {
      expect(await runSchema('', opts)).toBeInstanceOf(Array);
    });

    it.each<[unknown, string]>([
      [
        2,
        '"schema" function has invalid options specified. Example valid options: { "schema": { /* any JSON Schema can be defined here */ } , { "schema": { "type": "object" }, "dialect": "auto" }',
      ],
      [{ schema: { type: 'object' }, foo: true }, '"schema" function does not support "foo" option'],
      [{ schema: { type: 'object' }, oasVersion: 1 }, '"schema" function does not support "oasVersion" option'],
      [
        { schema: { type: 'object' }, dialect: 'foo' },
        '"schema" function and its "dialect" option accepts only the following values: "auto", "draft4", "draft6", "draft7", "draft2019-09", "draft2020-12"',
      ],
      [
        { schema: { type: 'object' }, allErrors: null },
        '"schema" function and its "allErrors" option accepts only the following types: boolean',
      ],
      [
        { schema: null, allErrors: null },
        `"schema" function and its "schema" option accepts only the following types: object
"schema" function and its "allErrors" option accepts only the following types: boolean`,
      ],
    ])('given invalid %p options, should throw', async (opts, error) => {
      await expect(runSchema([], opts)).rejects.toThrow(new RulesetValidationError(error));
    });
  });
});

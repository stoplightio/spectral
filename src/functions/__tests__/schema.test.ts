import { JSONSchema4, JSONSchema6 } from 'json-schema';
import { schema } from '../schema';

function runSchema(target: any, schemaObj: object) {
  return schema(target, { schema: schemaObj }, { given: [] }, { given: null, original: null });
}

describe('schema', () => {
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
          message: 'type should be array',
          path: [],
        }),
      ]);
    });

    test('errors with subtly invalid input', () => {
      const input = ['1', '2'];
      expect(runSchema(input, testSchema)).toEqual([
        expect.objectContaining({
          message: 'maxItems should NOT have more than 1 items',
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
          message: 'type should be string',
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
          message: '/foo Property baz is not expected to be here',
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
          message: 'format should match format "email"',
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

  describe('handles duplicate JSONSchema4 ids', () => {
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
        message: 'type should be string',
      },
    ]);
    expect(runSchema('a', testSchema2)).toEqual([]);
  });

  describe('handles duplicate JSONSchema6 ids', () => {
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
        message: 'type should be string',
      },
    ]);
    expect(runSchema('a', testSchema2)).toEqual([]);
  });
});

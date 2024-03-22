import type { RulesetFunctionContext } from '@stoplight/spectral-core';
import { oas2, oas3, oas3_0, oas3_1 } from '@stoplight/spectral-formats';
import type { DeepPartial } from '@stoplight/types';

import oasSchema from '../../functions/oasSchema';

function runSchema(target: unknown, schemaObj: Record<string, unknown>, context?: DeepPartial<RulesetFunctionContext>) {
  return oasSchema(target, { schema: schemaObj }, {
    path: [],
    documentInventory: {},
    ...context,
  } as RulesetFunctionContext);
}
describe('oasSchema', () => {
  test('given OAS2, supports x-nullable', () => {
    const document = {
      formats: new Set([oas2]),
    };

    const testSchema = {
      type: 'object',
      'x-nullable': true,
      properties: {
        foo: {
          type: 'number',
          'x-nullable': true,
        },
      },
    };

    expect(runSchema({}, testSchema, { document })).toEqual([]);
    expect(runSchema(null, testSchema, { document })).toEqual([]);
    expect(runSchema(2, testSchema, { document })).toEqual([
      {
        message: 'Value type must be object,null',
        path: [],
      },
    ]);
    expect(runSchema({ foo: null }, testSchema, { document })).toEqual([]);
    expect(runSchema({ foo: 2 }, testSchema, { document })).toEqual([]);
    expect(runSchema({ foo: 'test' }, testSchema, { document })).toEqual([
      {
        message: '"foo" property type must be number,null',
        path: ['foo'],
      },
    ]);

    expect(testSchema).toStrictEqual({
      type: 'object',
      'x-nullable': true,
      properties: {
        foo: {
          type: 'number',
          'x-nullable': true,
        },
      },
    });
  });

  describe('given OAS 3.0', () => {
    it('supports nullable', () => {
      const document = {
        formats: new Set([oas3, oas3_0]),
      };

      const testSchema = {
        type: 'object',
        nullable: true,
        properties: {
          foo: {
            type: 'number',
            nullable: true,
          },
        },
      };

      expect(runSchema({}, testSchema, { document })).toEqual([]);
      expect(runSchema(null, testSchema, { document })).toEqual([]);
      expect(runSchema(2, testSchema, { document })).toEqual([
        {
          message: 'Value type must be object,null',
          path: [],
        },
      ]);
      expect(runSchema({ foo: null }, testSchema, { document })).toEqual([]);
      expect(runSchema({ foo: 2 }, testSchema, { document })).toEqual([]);
      expect(runSchema({ foo: 'test' }, testSchema, { document })).toEqual([
        {
          message: '"foo" property type must be number,null',
          path: ['foo'],
        },
      ]);

      expect(testSchema).toStrictEqual({
        type: 'object',
        nullable: true,
        properties: {
          foo: {
            type: 'number',
            nullable: true,
          },
        },
      });
    });

    it('supports booleanish exclusiveMinimum & exclusiveMaximum', () => {
      const document = {
        formats: new Set([oas3, oas3_0]),
      };

      const testSchema = {
        type: 'number',
        minimum: 1,
        maximum: 3,
        exclusiveMinimum: true,
        exclusiveMaximum: true,
      };

      expect(runSchema(1, testSchema, { document })).toEqual([
        {
          message: 'Number must be > 1',
          path: [],
        },
      ]);

      expect(runSchema(3, testSchema, { document })).toEqual([
        {
          message: 'Number must be < 3',
          path: [],
        },
      ]);

      expect(runSchema(1.5, testSchema, { document })).toEqual([]);
    });
  });

  test('given OAS 3.1, supports numeric exclusiveMinimum & exclusiveMaximum', () => {
    const document = {
      formats: new Set([oas3, oas3_1]),
    };

    const testSchema = {
      type: 'number',
      exclusiveMinimum: 1,
    };

    expect(runSchema(1, testSchema, { document })).toEqual([
      {
        message: 'Number must be > 1',
        path: [],
      },
    ]);

    expect(runSchema(1.5, testSchema, { document })).toEqual([]);
  });
});

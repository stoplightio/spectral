/* eslint-disable @typescript-eslint/no-unsafe-return */
import { DeepPartial } from '@stoplight/types';
import { IFunctionValues } from '../../../../types';
import oasSchema from '../../functions/oasSchema';

function runSchema(target: unknown, schemaObj: Record<string, unknown>, context?: DeepPartial<IFunctionValues>) {
  return oasSchema(target, { schema: schemaObj }, { given: [] }, {
    given: null,
    original: null,
    ...context,
  } as IFunctionValues);
}
describe('oasSchema', () => {
  test('given OAS2, supports x-nullable', () => {
    const documentInventory = {
      document: {
        formats: ['oas2'],
      },
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

    expect(runSchema({}, testSchema, { documentInventory })).toEqual([]);
    expect(runSchema(null, testSchema, { documentInventory })).toEqual([]);
    expect(runSchema(2, testSchema, { documentInventory })).toEqual([
      {
        message: 'Value type must be object,null',
        path: [],
      },
    ]);
    expect(runSchema({ foo: null }, testSchema, { documentInventory })).toEqual([]);
    expect(runSchema({ foo: 2 }, testSchema, { documentInventory })).toEqual([]);
    expect(runSchema({ foo: 'test' }, testSchema, { documentInventory })).toEqual([
      {
        message: '`foo` property type must be number,null',
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

  test('given OAS3, supports nullable', () => {
    const documentInventory = {
      document: {
        formats: ['oas3'],
      },
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

    expect(runSchema({}, testSchema, { documentInventory })).toEqual([]);
    expect(runSchema(null, testSchema, { documentInventory })).toEqual([]);
    expect(runSchema(2, testSchema, { documentInventory })).toEqual([
      {
        message: 'Value type must be object,null',
        path: [],
      },
    ]);
    expect(runSchema({ foo: null }, testSchema, { documentInventory })).toEqual([]);
    expect(runSchema({ foo: 2 }, testSchema, { documentInventory })).toEqual([]);
    expect(runSchema({ foo: 'test' }, testSchema, { documentInventory })).toEqual([
      {
        message: '`foo` property type must be number,null',
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
});

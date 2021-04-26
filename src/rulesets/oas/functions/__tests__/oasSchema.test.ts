import { DeepPartial } from '@stoplight/types';
import { IFunctionValues } from '../../../../types';
import oasSchema from '../../functions/oasSchema';
import { functions } from '../../../../functions';

function runSchema(target: unknown, schemaObj: object, context?: DeepPartial<IFunctionValues>) {
  return oasSchema.call({ functions, cache: new Map() }, target, { schema: schemaObj }, { given: [] }, {
    given: null,
    original: null,
    ...context,
  } as IFunctionValues);
}
describe('oasSchema', () => {
  test('given OAS2, supports x-nullable', () => {
    const documentInventory = {
      document: {
        data: {
          swagger: '2.0',
        },
      },
    };

    const testSchema = {
      type: 'string',
      'x-nullable': true,
    };

    expect(runSchema('cxz', testSchema, { documentInventory })).toEqual([]);
    expect(runSchema(null, testSchema, { documentInventory })).toEqual([]);
    expect(runSchema(2, testSchema, { documentInventory })).toEqual([
      {
        message: 'Value type must be string,null',
        path: [],
      },
    ]);
  });

  test('given OAS3, supports nullable', () => {
    const documentInventory = {
      document: {
        data: {
          swagger: '2.0',
        },
      },
    };

    const testSchema = {
      type: 'string',
      nullable: true,
    };

    expect(runSchema('cxz', testSchema, { documentInventory })).toEqual([]);
    expect(runSchema(null, testSchema, { documentInventory })).toEqual([]);
    expect(runSchema(2, testSchema, { documentInventory })).toEqual([
      {
        message: 'Value type must be string,null',
        path: [],
      },
    ]);
  });
});

import { oas2, oas3, oas3_0, oas3_1 } from '@stoplight/spectral-formats';
import { DeepPartial } from '@stoplight/types';
import oasSchema from '../../functions/oasSchema';
import { createWithRules } from '../../__tests__/__helpers__/tester';
import { RulesetFunctionContext } from '@stoplight/spectral-core/src';

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

  test('given OAS 3.0, supports nullable', () => {
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

  test('should remove all redundant ajv errors', async () => {
    const spectral = createWithRules(['oas3-schema', 'oas3-valid-schema-example', 'oas3-valid-media-example']);
    const invalidSchema = JSON.stringify(require('../../__tests__/__fixtures__/petstore.invalid-schema.oas3.json'));

    const result = await spectral.run(invalidSchema);

    expect(result).toEqual([
      expect.objectContaining({
        code: 'oas3-schema',
        message: '"email" property must match format "email".',
        path: ['info', 'contact', 'email'],
      }),
      expect.objectContaining({
        code: 'oas3-schema',
        message: '"header-1" property must have required property "schema".',
        path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1'],
      }),
      expect.objectContaining({
        code: 'oas3-schema',
        message: 'Property "type" is not expected to be here.',
        path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1', 'type'],
      }),
      expect.objectContaining({
        code: 'oas3-schema',
        message: 'Property "op" is not expected to be here.',
        path: ['paths', '/pets', 'get', 'responses', '200', 'headers', 'header-1', 'op'],
      }),
      expect.objectContaining({
        code: 'invalid-ref',
      }),
      expect.objectContaining({
        code: 'invalid-ref',
      }),
      expect.objectContaining({
        code: 'oas3-valid-schema-example',
        message: '"example" property type must be number',
        path: ['components', 'schemas', 'foo', 'example'],
      }),
    ]);
  });
});

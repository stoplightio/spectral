import { schemaPath } from '../schema-path';

function runSchemaPath(target: any, field: string, schemaPathStr: string) {
  return schemaPath(target, { field, schemaPath: schemaPathStr }, { given: [], target: [] }, {
    given: null,
    original: target,
  } as any);
}

describe('schema', () => {
  // Check the example field matches the contents of schema
  const fieldToCheck = 'example';
  const path = '$.schema';

  test('will pass when example is valid', () => {
    const target = {
      schema: {
        type: 'string',
      },
      example: 'turtle',
    };

    expect(runSchemaPath(target, fieldToCheck, path)).toHaveLength(0);
  });

  test('will pass when example is valid', () => {
    const target = {
      schema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
          },
        },
        required: ['url'],
      },
      example: {
        url: 'images/38.png',
      },
    };

    expect(runSchemaPath(target, fieldToCheck, path)).toHaveLength(0);
  });

  test('will error with totally invalid input', () => {
    const target = {
      schema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
          },
        },
        required: ['url'],
      },
      example: {
        notUrl: 'images/38.png',
      },
    };
    expect(runSchemaPath(target, fieldToCheck, path)).toEqual([
      {
        path: ['example'],
        message: 'object should have required property `url`',
      },
    ]);
  });

  test('will error formats', () => {
    const target = {
      schema: {
        type: 'string',
        format: 'url',
      },
      example: 'turtle',
    };

    expect(runSchemaPath(target, fieldToCheck, path)).toEqual([
      {
        message: '{{property|gravis|append-property|optional-typeof}}format should match format `url`',
        path: ['example'],
      },
    ]);
  });

  describe('when schema path is not there', () => {
    const invalidFieldToCheck = 'nonsense';

    test('will pass when field is not there', () => {
      const target = {
        schema: {
          type: 'string',
        },
        notNonsense: 'turtle',
      };
      expect(runSchemaPath(target, invalidFieldToCheck, path)).toHaveLength(0);
    });
  });
});

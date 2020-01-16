import { schemaPath } from '../schema-path';

function runSchemaPath(target: any, field: string, schemaPathStr: string) {
  return schemaPath(target, { field, schemaPath: schemaPathStr }, { given: [], target: [] }, {
    given: null,
    original: target,
  } as any);
}

describe('schema-path', () => {
  // Check the example field matches the contents of schema
  const fieldToCheck = 'example';
  const path = '$.schema';

  test.each([
    ['turtle', 'string'],
    [0, 'number'],
    [null, 'null'],
  ])('will pass when %s example is valid', (example, type) => {
    const target = {
      schema: {
        type,
      },
      example,
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

  test('will error with invalid falsy input', () => {
    const target = {
      schema: {
        type: 'string',
      },
      example: null,
    };
    expect(runSchemaPath(target, fieldToCheck, path)).toEqual([
      {
        path: ['example'],
        message: '{{property|gravis|append-property|optional-typeof}}type should be string',
      },
    ]);
  });

  test('will error with invalid array-ish input', () => {
    const target = {
      schema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
      },
      examples: {
        'application/json': {
          id: 1,
          name: 'get food',
          completed: false,
        },
        'application/yaml': {
          id: 1,
          name: 'get food',
          completed: false,
        },
      },
    };
    expect(runSchemaPath(target, '$.examples.*', path)).toEqual([
      {
        message: '{{property|gravis|append-property|optional-typeof}}type should be string',
        path: ['examples', 'application/json', 'id'],
      },
      {
        message: '{{property|gravis|append-property|optional-typeof}}type should be string',
        path: ['examples', 'application/yaml', 'id'],
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
      expect(runSchemaPath(target, invalidFieldToCheck, path)).toEqual([
        {
          message: '{{property|double-quotes|append-property}}does not exist',
          path: ['nonsense'],
        },
      ]);
    });
  });
});

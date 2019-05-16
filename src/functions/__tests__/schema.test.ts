import { schema } from '../schema';

function runSchema(target: any, schemaObj: object) {
  return schema(target, { schema: schemaObj }, { given: ['$'] }, { given: null, original: null });
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
          message: 'should be array',
          path: ['$'],
        }),
      ]);
    });

    test('errors with subtly invalid input', () => {
      const input = ['1', '2'];
      expect(runSchema(input, testSchema)).toEqual([
        expect.objectContaining({
          message: 'should NOT have more than 1 items',
          path: ['$'],
        }),
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
          message: 'should match format "email"',
          path: ['$'],
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
});

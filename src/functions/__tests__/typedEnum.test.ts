import { typedEnum } from '../typedEnum';

const defaultReportingThreshold = 3;

function runTypedEnum(targetVal: any, reportingThreshold: any) {
  return typedEnum(
    targetVal,
    { reportingThreshold },
    { given: ['$'] },
    { given: null, original: null, resolved: {} as any },
  );
}

describe('typedEnum', () => {
  describe('parameters validation', () => {
    test.each([1, { a: 1 }, 'nope', undefined])('is undefined when the enum is not an array (%s)', enumContent => {
      const schema = {
        type: 'integer',
        enum: enumContent,
      };

      expect(runTypedEnum(schema, defaultReportingThreshold)).toBeUndefined();
    });
  });

  test('is undefined when the enum contains no value', () => {
    const schema = {
      type: 'integer',
      enum: [],
    };

    expect(runTypedEnum(schema, defaultReportingThreshold)).toBeUndefined();
  });

  describe('basic', () => {
    test('is undefined when all enum values respect the type', () => {
      const schema = {
        type: 'integer',
        enum: [123, 456],
      };

      expect(runTypedEnum(schema, defaultReportingThreshold)).toBeUndefined();
    });

    test('is undefined when all enum values respect the type', () => {
      const schema = {
        type: 'integer',
        enum: [123, 456],
      };

      expect(runTypedEnum(schema, defaultReportingThreshold)).toBeUndefined();
    });

    test.each([undefined])('is undefined when type is "%s"', (typeValue: unknown) => {
      const schema = {
        type: typeValue,
        enum: [123, 456],
      };

      expect(runTypedEnum(schema, defaultReportingThreshold)).toBeUndefined();
    });

    test('identifies enum values which do not respect the type', () => {
      const schema = {
        type: 'integer',
        enum: [123, 'a string!', 456, 'and another one!'],
      };

      expect(runTypedEnum(schema, defaultReportingThreshold)).toEqual([
        {
          message: 'Enum value `a string!` does not respect the specified type `integer`.',
          path: ['$', 'enum', 1],
        },
        {
          message: 'Enum value `and another one!` does not respect the specified type `integer`.',
          path: ['$', 'enum', 3],
        },
      ]);
    });
  });

  describe('types', () => {
    const testCases: Array<[string, unknown[], unknown]> = [
      ['string', ['Hello', 'world!'], 12],
      ['number', [-2147483648, 17.13], 'Hello'],
      ['integer', [-2147483648, 17], 12.3],
      ['boolean', [true, false], 1],
    ];

    test.each(testCases)(
      'does not report anything when all the definitions are valid for type "%s"',
      async (type: string, valids: unknown[], invalid: unknown) => {
        const schema = {
          type,
          enum: valids,
        };

        expect(runTypedEnum(schema, defaultReportingThreshold)).toBeUndefined();
      },
    );

    test.each(testCases)(
      'identifies enum value which does not respect the type "%s"',
      async (type: string, valids: unknown[], invalid: unknown) => {
        const schema = {
          type,
          enum: [valids[0], invalid],
        };

        const results = runTypedEnum(schema, defaultReportingThreshold);

        expect(results[0].message).toContain(`value \`${invalid}\``);
      },
    );
  });
});

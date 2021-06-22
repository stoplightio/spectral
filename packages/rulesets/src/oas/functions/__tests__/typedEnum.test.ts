import { typedEnum } from '../typedEnum';
import { Document } from '@stoplight/spectral-core';
import { DocumentInventory } from '@stoplight/spectral-core/src/documentInventory';
import * as Parsers from '@stoplight/spectral-parsers';
import { Resolver } from '@stoplight/spectral-ref-resolver';

function runTypedEnum(targetVal: any) {
  const doc = new Document(JSON.stringify(targetVal), Parsers.Json);

  return typedEnum(
    targetVal,
    null,
    { given: ['$'] },
    { given: null, original: null, documentInventory: new DocumentInventory(doc, new Resolver()), rule: {} as any },
  );
}

describe('typedEnum', () => {
  describe('parameters validation', () => {
    test.each([1, { a: 1 }, 'nope', undefined])('is undefined when the enum is not an array (%s)', enumContent => {
      const schema = {
        type: 'integer',
        enum: enumContent,
      };

      expect(runTypedEnum(schema)).toBeUndefined();
    });
  });

  test('is undefined when the enum contains no value', () => {
    const schema = {
      type: 'integer',
      enum: [],
    };

    expect(runTypedEnum(schema)).toBeUndefined();
  });

  describe('basic', () => {
    test('is undefined when all enum values respect the type', () => {
      const schema = {
        type: 'integer',
        enum: [123, 456],
      };

      expect(runTypedEnum(schema)).toBeUndefined();
    });

    test('is undefined when all enum values respect the type', () => {
      const schema = {
        type: 'integer',
        enum: [123, 456],
      };

      expect(runTypedEnum(schema)).toBeUndefined();
    });

    test.each([undefined])('is undefined when type is "%s"', (typeValue: unknown) => {
      const schema = {
        type: typeValue,
        enum: [123, 456],
      };

      expect(runTypedEnum(schema)).toBeUndefined();
    });

    test('identifies enum values which do not respect the type', () => {
      const schema = {
        type: 'integer',
        enum: [123, 'a string!', 456, 'and another one!'],
      };

      expect(runTypedEnum(schema)).toEqual([
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
      async (type: string, valids: unknown[]) => {
        const schema = {
          type,
          enum: valids,
        };

        expect(runTypedEnum(schema)).toBeUndefined();
      },
    );

    test.each(testCases)(
      'identifies enum value which does not respect the type "%s"',
      async (type: string, valids: unknown[], invalid: unknown) => {
        const schema = {
          type,
          enum: [valids[0], invalid],
        };

        const results = runTypedEnum(schema);

        expect(results[0].message).toContain(`value \`${invalid}\``);
      },
    );
  });
});

import casing, { CasingType } from '../casing';
import testFunction from './__helpers__/tester';
import { RulesetValidationError } from '../../ruleset';

const runCasing = testFunction.bind(null, casing);

describe('Core Functions / Casing', () => {
  it('given non-string input, should return no error message', async () => {
    expect(await runCasing(false, { type: CasingType.camel })).toEqual([]);
    expect(await runCasing(1, { type: CasingType.camel })).toEqual([]);
  });

  it('given empty string input, should return no error message', async () => {
    expect(await runCasing('', { type: CasingType.camel })).toEqual([]);
  });

  describe('casing type', () => {
    describe('flat', () => {
      const invalid = ['foo_test', 'Foo', '123', '1d', 'foo-bar'];
      const valid = ['foo', 'foobar'];
      const validWithDigits = ['foo9bar', 'foo24baz', 'foo1'];

      it.each(invalid)('should recognize invalid input %p', async input => {
        expect(await runCasing(input, { type: CasingType.flat })).toEqual([{ message: 'must be flat case', path: [] }]);
      });

      it.each([...valid, ...validWithDigits])('given valid %p input, should return no error message', async input => {
        expect(await runCasing(input, { type: CasingType.flat })).toEqual([]);
      });

      describe('when digits are disallowed', () => {
        it.each([...invalid, ...validWithDigits])('should recognize invalid input %s', async input => {
          expect(await runCasing(input, { type: CasingType.flat, disallowDigits: true })).toEqual([
            { message: 'must be flat case', path: [] },
          ]);
        });

        it.each(valid)('given valid %p input, should return no error message', async input => {
          expect(await runCasing(input, { type: CasingType.flat, disallowDigits: true })).toEqual([]);
        });
      });
    });

    describe('camel', () => {
      const invalid = ['foo_test', 'Foo', '1fooBarBaz', '123', 'foo-bar'];
      const valid = ['foo', 'fooBar', 'fooBarBaz', 'coordinateX'];
      const validWithDigits = ['foo1', 'foo24Bar', 'fooBar0Baz323'];

      it.each(invalid)('given invalid %p input, should return an error message', async input => {
        expect(await runCasing(input, { type: CasingType.camel })).toEqual([
          { message: 'must be camel case', path: [] },
        ]);
      });

      it.each([valid, ...validWithDigits])('given valid %p input, should return no error message', async input => {
        expect(await runCasing(input, { type: CasingType.camel })).toEqual([]);
      });

      describe('when digits are disallowed', () => {
        it.each([...invalid, ...validWithDigits])(
          'given invalid %p input, should return an error message',
          async input => {
            expect(await runCasing(input, { type: CasingType.camel, disallowDigits: true })).toEqual([
              { message: 'must be camel case', path: [] },
            ]);
          },
        );

        it.each(valid)('given valid %p input, should return no error message', async input => {
          expect(await runCasing(input, { type: CasingType.camel, disallowDigits: true })).toEqual([]);
        });
      });
    });

    describe('pascal', () => {
      const invalid = ['foo_test', '123', '1fooBarBaz', 'fooBarBaz1', 'fooBar', 'foo1', 'foo-bar'];
      const valid = ['Foo', 'FooBar', 'FooBarBaz', 'CoordinateZ'];
      const validWithDigits = ['Foo1', 'FooBarBaz1'];

      it.each(invalid)('given invalid %p input, should return an error message', async input => {
        expect(await runCasing(input, { type: CasingType.pascal })).toEqual([
          { message: 'must be pascal case', path: [] },
        ]);
      });

      it.each([valid, ...validWithDigits])('given valid %p input, should return no error message', async input => {
        expect(await runCasing(input, { type: CasingType.pascal })).toEqual([]);
      });

      describe('when digits are disallowed', () => {
        it.each([...invalid, ...validWithDigits])(
          'given invalid %p input, should return an error message',
          async input => {
            expect(await runCasing(input, { type: CasingType.pascal, disallowDigits: true })).toEqual([
              { message: 'must be pascal case', path: [] },
            ]);
          },
        );

        it.each(valid)('given valid %p input, should return no error message', async input => {
          expect(await runCasing(input, { type: CasingType.pascal, disallowDigits: true })).toEqual([]);
        });
      });
    });

    describe('kebab', () => {
      const invalid = [
        'foo_test',
        'Foo1',
        '123',
        'fooBarBaz1',
        'fooBar',
        'foO',
        'foo-baR',
        '1foo-bar',
        'foo--bar',
        'foo-',
        '-foo',
      ];

      const valid = ['foo', 'foo-bar', 'foo-bar-baz'];
      const validWithDigits = ['foo-bar1', 'foo1-2bar'];

      it.each(invalid)('given invalid %p input, should return an error message', async input => {
        expect(await runCasing(input, { type: CasingType.kebab })).toEqual([
          { message: 'must be kebab case', path: [] },
        ]);
      });

      it.each([...valid, ...validWithDigits])('given valid %p input, should return no error message', async input => {
        expect(await runCasing(input, { type: CasingType.kebab })).toEqual([]);
      });

      describe('when digits are disallowed', () => {
        it.each([...invalid, ...validWithDigits])(
          'given invalid %p input, should return an error message',
          async input => {
            expect(await runCasing(input, { type: CasingType.kebab, disallowDigits: true })).toEqual([
              { message: 'must be kebab case', path: [] },
            ]);
          },
        );

        it.each(valid)('given valid %p input, should return no error message', async input => {
          expect(await runCasing(input, { type: CasingType.kebab, disallowDigits: true })).toEqual([]);
        });
      });
    });

    describe('cobol', () => {
      const invalid = ['foo_test', 'Foo1', '123', 'fooBarBaz1', 'FOo', 'FOO-BAr', 'FOO--BAR', 'FOO-', '-FOO'];
      const valid = ['FOO', 'FOO-BAR', 'FOO-BAR-BAZ'];
      const validWithDigits = ['FOO-BAR1', 'FOO2-3BAR1'];

      it.each(invalid)('given invalid %p input, should return an error message', async input => {
        expect(await runCasing(input, { type: CasingType.cobol })).toEqual([
          { message: 'must be cobol case', path: [] },
        ]);
      });

      it.each([...valid, ...validWithDigits])('given valid %p input, should return no error message', async input => {
        expect(await runCasing(input, { type: CasingType.cobol })).toEqual([]);
      });

      describe('when digits are disallowed', () => {
        it.each([...invalid, ...validWithDigits])(
          'given invalid %p input, should return an error message',
          async input => {
            expect(await runCasing(input, { type: CasingType.cobol, disallowDigits: true })).toEqual([
              { message: 'must be cobol case', path: [] },
            ]);
          },
        );

        it.each(valid)('given valid %p input, should return no error message', async input => {
          expect(await runCasing(input, { type: CasingType.cobol, disallowDigits: true })).toEqual([]);
        });
      });
    });

    describe('snake', () => {
      const invalid = ['Foo1', '123', 'fooBarBaz1', 'FOo', 'FOO-BAR', 'foo__bar', '1foo_bar1', 'foo_', '_foo'];
      const valid = ['foo', 'foo_bar', 'foo_bar_baz'];
      const validWithDigits = ['foo_bar1', 'foo2_4bar1'];

      it.each(invalid)('given invalid %p input, should return an error message', async input => {
        expect(await runCasing(input, { type: CasingType.snake })).toEqual([
          { message: 'must be snake case', path: [] },
        ]);
      });

      it.each([...valid, ...validWithDigits])('given valid %p input, should return no error message', async input => {
        expect(await runCasing(input, { type: CasingType.snake })).toEqual([]);
      });

      describe('when digits are disallowed', () => {
        it.each([...invalid, ...validWithDigits])(
          'given invalid %p input, should return an error message',
          async input => {
            expect(await runCasing(input, { type: CasingType.snake, disallowDigits: true })).toEqual([
              { message: 'must be snake case', path: [] },
            ]);
          },
        );

        it.each(valid)('given valid %p input, should return no error message', async input => {
          expect(await runCasing(input, { type: CasingType.snake, disallowDigits: true })).toEqual([]);
        });
      });
    });

    describe('macro', () => {
      const invalid = [
        'foo_test',
        'Foo1',
        '123',
        'fooBarBaz1',
        'FOo',
        'FOO-BAR',
        'FO__BAR',
        '1FOO_BAR1',
        'FOO___BAR1',
        'FOO_',
        '_FOO',
      ];
      const valid = ['FOO', 'FOO_BAR', 'FOO_BAR_BAZ'];
      const validWithDigits = ['FOO_BAR1', 'FOO2_4BAR1', 'FOO2_4_2'];

      it.each(invalid)('given invalid %p input, should return an error message', async input => {
        expect(await runCasing(input, { type: CasingType.macro })).toEqual([
          { message: 'must be macro case', path: [] },
        ]);
      });

      it.each([...valid, ...validWithDigits])('given valid %p input, should return no error message', async input => {
        expect(await runCasing(input, { type: CasingType.macro })).toEqual([]);
      });

      describe('when digits are disallowed', () => {
        it.each([...invalid, ...validWithDigits])(
          'given invalid %p input, should return an error message',
          async input => {
            expect(await runCasing(input, { type: CasingType.macro, disallowDigits: true })).toEqual([
              { message: 'must be macro case', path: [] },
            ]);
          },
        );

        it.each(valid)('given valid %p input, should return no error message', async input => {
          expect(await runCasing(input, { type: CasingType.macro, disallowDigits: true })).toEqual([]);
        });
      });
    });
  });

  describe('casing with custom separator configuration', () => {
    const baseData: Array<[CasingType, string, string, string]> = [[CasingType.flat, 'flat', 'flat01', 'Nope']];

    const testCases: Array<[CasingType, boolean, string, boolean, string, string, string]> = [];
    Object.values(baseData).forEach(data =>
      ['/', '*', '-'].forEach(char =>
        [true, false].forEach(allowLeading =>
          [true, false].forEach(disallowDigits =>
            testCases.push([data[0], disallowDigits, char, allowLeading, data[1], data[2], data[3]]),
          ),
        ),
      ),
    );

    describe('properly detects valid cases', () => {
      it.each(testCases)(
        'with type "%s", disallowDigits: %s, separator: "%s", allowLeadingSeparator: %s',
        async (type, disallowDigits, char, allowLeading, simple, withDigits, invalid) => {
          expect(
            await runCasing(`${simple}${char}${simple}`, {
              type,
              disallowDigits,
              separator: {
                char,
                allowLeading,
              },
            }),
          ).toEqual([]);

          expect(
            await runCasing(`${simple}${char}${invalid}`, {
              type,
              disallowDigits,
              separator: {
                char,
                allowLeading,
              },
            }),
          ).toEqual([{ message: `must be ${type} case`, path: [] }]);

          const digitsResults = await runCasing(`${withDigits}${char}${simple}`, {
            type,
            disallowDigits,
            separator: {
              char,
              allowLeading,
            },
          });

          if (!disallowDigits) {
            expect(digitsResults).toEqual([]);
          } else {
            expect(digitsResults).toEqual([{ message: `must be ${type} case`, path: [] }]);
          }

          const leadingSepResults = await runCasing(`${char}${simple}${char}${simple}`, {
            type,
            disallowDigits,
            separator: {
              char,
              allowLeading,
            },
          });

          if (allowLeading) {
            expect(leadingSepResults).toEqual([]);
          } else {
            expect(leadingSepResults).toEqual([{ message: `must be ${type} case`, path: [] }]);
          }
        },
      );
    });

    it.each(Object.values(CasingType))('properly detects leading char for %s casing', async type => {
      const opts = {
        type,
        disallowDigits: true,
        separator: {
          allowLeading: true,
          char: '/',
        },
      };
      expect(await runCasing('/', opts)).toEqual([]);
      expect(await runCasing('//', opts)).toEqual([{ message: `must be ${type} case`, path: [] }]);
    });

    it('allows advanced scenarios', async () => {
      expect(
        await runCasing('X-MyAmazing-Header', {
          type: CasingType.pascal,
          disallowDigits: true,
          separator: {
            char: '-',
          },
        }),
      ).toEqual([]);
      expect(
        await runCasing('/path/to/myResource', {
          type: CasingType.camel,
          disallowDigits: true,
          separator: {
            char: '/',
            allowLeading: true,
          },
        }),
      ).toEqual([]);
    });
  });

  describe('validation', () => {
    it.each([
      { type: 'cobol' },
      { type: 'macro', disallowDigits: true },
      { type: 'snake', disallowDigits: true, separator: { char: 'a' } },
      { type: 'pascal', disallowDigits: false, separator: { char: 'b', allowLeading: true } },
    ])('given valid %p options, should not throw', async opts => {
      await expect(runCasing('foo', opts)).resolves.toBeInstanceOf(Array);
    });

    it.each<[unknown, string]>([
      [
        { type: 'foo' },
        '"casing" function and its "type" option accept the following values: flat, camel, pascal, kebab, cobol, snake, macro',
      ],
      [{ type: 'macro', foo: true }, '"casing" function does not support "foo" option'],
      [
        {
          type: 'pascal',
          disallowDigits: false,
          separator: {},
        },
        '"casing" function is missing "separator.char" option',
      ],
      [
        {
          type: 'pascal',
          disallowDigits: false,
          separator: { allowLeading: true },
        },
        '"casing" function is missing "separator.char" option',
      ],
      [
        { type: 'snake', separator: { char: 'a', foo: true } },
        '"casing" function does not support "separator.foo" option',
      ],
      [
        {
          type: 'pascal',
          separator: {
            char: 'fo',
          },
        },
        '"casing" function and its "separator.char" option accepts only char, i.e. "I" or "/"',
      ],
      [
        {
          type: 'pascal',
          separator: {
            char: null,
          },
        },
        '"casing" function and its "separator.char" option accepts only char, i.e. "I" or "/"',
      ],
    ])('given invalid %p options, should throw', async (opts, error) => {
      await expect(runCasing('foo', opts)).rejects.toThrow(new RulesetValidationError(error));
    });
  });
});

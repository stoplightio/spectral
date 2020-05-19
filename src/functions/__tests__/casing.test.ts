import { casing, CasingType } from '../casing';

function runCasing(target: unknown, type: CasingType, disallowDigits?: boolean, separator?: any) {
  return casing(
    target,
    { type, disallowDigits, separator },
    { given: ['$'] },
    { given: null, original: null, documentInventory: {} as any, rule: {} as any },
  );
}

describe('casing', () => {
  test('given non-string target should return nothing', () => {
    expect(runCasing(false, CasingType.camel)).toBeUndefined();
    expect(runCasing(1, CasingType.camel)).toBeUndefined();
  });

  test('given empty string target should return nothing', () => {
    expect(runCasing('', CasingType.camel)).toBeUndefined();
  });

  describe('casing type', () => {
    describe('flat', () => {
      const invalid = ['foo_test', 'Foo', '123', '1d', 'foo-bar'];
      const valid = ['foo', 'foobar'];
      const validWithDigits = ['foo9bar', 'foo24baz', 'foo1'];

      test.each(invalid)('should recognize invalid target %s', target => {
        expect(runCasing(target, CasingType.flat)).toEqual([{ message: 'must be flat case' }]);
      });

      test.each([...valid, ...validWithDigits])('should recognize valid target %s', target => {
        expect(runCasing(target, CasingType.flat)).toBeUndefined();
      });

      describe('when digits are disallowed', () => {
        test.each([...invalid, ...validWithDigits])('should recognize invalid target %s', target => {
          expect(runCasing(target, CasingType.flat, true)).toEqual([{ message: 'must be flat case' }]);
        });

        test.each(valid)('should recognize valid target %s', target => {
          expect(runCasing(target, CasingType.flat, true)).toBeUndefined();
        });
      });
    });

    describe('camel', () => {
      const invalid = ['foo_test', 'Foo', '1fooBarBaz', '123', 'foo-bar'];
      const valid = ['foo', 'fooBar', 'fooBarBaz'];
      const validWithDigits = ['foo1', 'foo24Bar', 'fooBar0Baz323'];

      test.each(invalid)('should recognize invalid target %s', target => {
        expect(runCasing(target, CasingType.camel)).toEqual([{ message: 'must be camel case' }]);
      });

      test.each([valid, ...validWithDigits])('should recognize valid target %s', target => {
        expect(runCasing(target, CasingType.camel)).toBeUndefined();
      });

      describe('when digits are disallowed', () => {
        test.each([...invalid, ...validWithDigits])('should recognize invalid target %s', target => {
          expect(runCasing(target, CasingType.camel, true)).toEqual([{ message: 'must be camel case' }]);
        });

        test.each(valid)('should recognize valid target %s', target => {
          expect(runCasing(target, CasingType.camel, true)).toBeUndefined();
        });
      });
    });

    describe('pascal', () => {
      const invalid = ['foo_test', '123', '1fooBarBaz', 'fooBarBaz1', 'fooBar', 'foo1', 'foo-bar'];
      const valid = ['Foo', 'FooBar', 'FooBarBaz'];
      const validWithDigits = ['Foo1', 'FooBarBaz1'];

      test.each(invalid)('should recognize invalid target %s', target => {
        expect(runCasing(target, CasingType.pascal)).toEqual([{ message: 'must be pascal case' }]);
      });

      test.each([valid, ...validWithDigits])('should recognize valid target %s', target => {
        expect(runCasing(target, CasingType.pascal)).toBeUndefined();
      });

      describe('when digits are disallowed', () => {
        test.each([...invalid, ...validWithDigits])('should recognize invalid target %s', target => {
          expect(runCasing(target, CasingType.pascal, true)).toEqual([{ message: 'must be pascal case' }]);
        });

        test.each(valid)('should recognize valid target %s', target => {
          expect(runCasing(target, CasingType.pascal, true)).toBeUndefined();
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

      test.each(invalid)('should recognize invalid target %s', target => {
        expect(runCasing(target, CasingType.kebab)).toEqual([{ message: 'must be kebab case' }]);
      });

      test.each([...valid, ...validWithDigits])('should recognize valid target %s', target => {
        expect(runCasing(target, CasingType.kebab)).toBeUndefined();
      });

      describe('when digits are disallowed', () => {
        test.each([...invalid, ...validWithDigits])('should recognize invalid target %s', target => {
          expect(runCasing(target, CasingType.kebab, true)).toEqual([{ message: 'must be kebab case' }]);
        });

        test.each(valid)('should recognize valid target %s', target => {
          expect(runCasing(target, CasingType.kebab, true)).toBeUndefined();
        });
      });
    });

    describe('cobol', () => {
      const invalid = ['foo_test', 'Foo1', '123', 'fooBarBaz1', 'FOo', 'FOO-BAr', 'FOO--BAR', 'FOO-', '-FOO'];
      const valid = ['FOO', 'FOO-BAR', 'FOO-BAR-BAZ'];
      const validWithDigits = ['FOO-BAR1', 'FOO2-3BAR1'];

      test.each(invalid)('should recognize invalid target %s', target => {
        expect(runCasing(target, CasingType.cobol)).toEqual([{ message: 'must be cobol case' }]);
      });

      test.each([...valid, ...validWithDigits])('should recognize valid target %s', target => {
        expect(runCasing(target, CasingType.cobol)).toBeUndefined();
      });

      describe('when digits are disallowed', () => {
        test.each([...invalid, ...validWithDigits])('should recognize invalid target %s', target => {
          expect(runCasing(target, CasingType.cobol, true)).toEqual([{ message: 'must be cobol case' }]);
        });

        test.each(valid)('should recognize valid target %s', target => {
          expect(runCasing(target, CasingType.cobol, true)).toBeUndefined();
        });
      });
    });

    describe('snake', () => {
      const invalid = ['Foo1', '123', 'fooBarBaz1', 'FOo', 'FOO-BAR', 'foo__bar', '1foo_bar1', 'foo_', '_foo'];
      const valid = ['foo', 'foo_bar', 'foo_bar_baz'];
      const validWithDigits = ['foo_bar1', 'foo2_4bar1'];

      test.each(invalid)('should recognize invalid target %s', target => {
        expect(runCasing(target, CasingType.snake)).toEqual([{ message: 'must be snake case' }]);
      });

      test.each([...valid, ...validWithDigits])('should recognize valid target %s', target => {
        expect(runCasing(target, CasingType.snake)).toBeUndefined();
      });

      describe('when digits are disallowed', () => {
        test.each([...invalid, ...validWithDigits])('should recognize invalid target %s', target => {
          expect(runCasing(target, CasingType.snake, true)).toEqual([{ message: 'must be snake case' }]);
        });

        test.each(valid)('should recognize valid target %s', target => {
          expect(runCasing(target, CasingType.snake, true)).toBeUndefined();
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

      test.each(invalid)('should recognize invalid target %s', target => {
        expect(runCasing(target, CasingType.macro)).toEqual([{ message: 'must be macro case' }]);
      });

      test.each([...valid, ...validWithDigits])('should recognize valid target %s', target => {
        expect(runCasing(target, CasingType.macro)).toBeUndefined();
      });

      describe('when digits are disallowed', () => {
        test.each([...invalid, ...validWithDigits])('should recognize invalid target %s', target => {
          expect(runCasing(target, CasingType.macro, true)).toEqual([{ message: 'must be macro case' }]);
        });

        test.each(valid)('should recognize valid target %s', target => {
          expect(runCasing(target, CasingType.macro, true)).toBeUndefined();
        });
      });
    });
  });

  describe('casing with custom separator configuration', () => {
    const baseData: Array<[string, string, string, string]> = [[CasingType.flat, 'flat', 'flat01', 'Nope']];

    const testCases: Array<[string, boolean, string, boolean, string, string, string]> = [];
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
      test.each(testCases)(
        'with type "%s", disallowDigits: %s, separator: "%s", allowLeadingSeparator: %s',
        (type, disallowDigits, char, allowLeading, simple, withDigits, invalid) => {
          expect(
            runCasing(`${simple}${char}${simple}`, CasingType[type], disallowDigits, { char, allowLeading }),
          ).toBeUndefined();

          expect(
            runCasing(`${simple}${char}${invalid}`, CasingType[type], disallowDigits, { char, allowLeading }),
          ).toEqual([{ message: `must be ${type} case` }]);

          const digitsResults = runCasing(`${withDigits}${char}${simple}`, CasingType[type], disallowDigits, {
            char,
            allowLeading,
          });

          if (!disallowDigits) {
            expect(digitsResults).toBeUndefined();
          } else {
            expect(digitsResults).toEqual([{ message: `must be ${type} case` }]);
          }

          const leadingSepResults = runCasing(`${char}${simple}${char}${simple}`, CasingType[type], disallowDigits, {
            char,
            allowLeading,
          });

          if (allowLeading) {
            expect(leadingSepResults).toBeUndefined();
          } else {
            expect(leadingSepResults).toEqual([{ message: `must be ${type} case` }]);
          }
        },
      );
    });

    test('allows advanced scenarios', () => {
      expect(runCasing('X-MyAmazing-Header', CasingType.pascal, true, { char: '-' })).toBeUndefined();
      expect(
        runCasing('/path/to/myResource', CasingType.camel, true, { char: '/', allowLeading: true }),
      ).toBeUndefined();
    });
  });
});

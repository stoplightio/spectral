import { ICasingOptions } from '../../types';
import { casing } from '../casing';

function runCasing(target: unknown, type: ICasingOptions['type'], disallowDigits?: boolean) {
  return casing(
    target,
    { type, disallowDigits },
    { given: ['$'] },
    { given: null, original: null, resolved: {} as any },
  );
}

describe('casing', () => {
  test('given non-string target should return nothing', () => {
    expect(runCasing(false, 'camel')).toBeUndefined();
    expect(runCasing(1, 'camel')).toBeUndefined();
  });

  test('given empty string target should return nothing', () => {
    expect(runCasing('', 'camel')).toBeUndefined();
  });

  test('given unknown case type should return nothing', () => {
    expect(runCasing('2', 'foo' as any)).toBeUndefined();
  });

  describe('casing type', () => {
    describe('flat', () => {
      const invalid = ['foo_test', 'Foo', '123', '1d', 'foo-bar'];
      const valid = ['foo', 'foobar'];
      const validWithDigits = ['foo9bar', 'foo24baz', 'foo1'];

      test.each(invalid)('should recognize invalid target %s', target => {
        expect(runCasing(target, 'flat')).toEqual([{ message: 'must be flat case' }]);
      });

      test.each([...valid, ...validWithDigits])('should recognize valid target %s', target => {
        expect(runCasing(target, 'flat')).toBeUndefined();
      });

      describe('when digits are disallowed', () => {
        test.each([...invalid, ...validWithDigits])('should recognize invalid target %s', target => {
          expect(runCasing(target, 'flat', true)).toEqual([{ message: 'must be flat case' }]);
        });

        test.each(valid)('should recognize valid target %s', target => {
          expect(runCasing(target, 'flat', true)).toBeUndefined();
        });
      });
    });

    describe('camel', () => {
      const invalid = ['foo_test', 'Foo', '1fooBarBaz', '123', 'foo-bar'];
      const valid = ['foo', 'fooBar', 'fooBarBaz'];
      const validWithDigits = ['foo1', 'foo24Bar', 'fooBar0Baz323'];

      test.each(invalid)('should recognize invalid target %s', target => {
        expect(runCasing(target, 'camel')).toEqual([{ message: 'must be camel case' }]);
      });

      test.each([valid, ...validWithDigits])('should recognize valid target %s', target => {
        expect(runCasing(target, 'camel')).toBeUndefined();
      });

      describe('when digits are disallowed', () => {
        test.each([...invalid, ...validWithDigits])('should recognize invalid target %s', target => {
          expect(runCasing(target, 'camel', true)).toEqual([{ message: 'must be camel case' }]);
        });

        test.each(valid)('should recognize valid target %s', target => {
          expect(runCasing(target, 'camel', true)).toBeUndefined();
        });
      });
    });

    describe('pascal', () => {
      const invalid = ['foo_test', '123', '1fooBarBaz', 'fooBarBaz1', 'fooBar', 'foo1', 'foo-bar'];
      const valid = ['Foo', 'FooBar', 'FooBarBaz'];
      const validWithDigits = ['Foo1', 'FooBarBaz1'];

      test.each(invalid)('should recognize invalid target %s', target => {
        expect(runCasing(target, 'pascal')).toEqual([{ message: 'must be pascal case' }]);
      });

      test.each([valid, ...validWithDigits])('should recognize valid target %s', target => {
        expect(runCasing(target, 'pascal')).toBeUndefined();
      });

      describe('when digits are disallowed', () => {
        test.each([...invalid, ...validWithDigits])('should recognize invalid target %s', target => {
          expect(runCasing(target, 'pascal', true)).toEqual([{ message: 'must be pascal case' }]);
        });

        test.each(valid)('should recognize valid target %s', target => {
          expect(runCasing(target, 'pascal', true)).toBeUndefined();
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
        expect(runCasing(target, 'kebab')).toEqual([{ message: 'must be kebab case' }]);
      });

      test.each([...valid, ...validWithDigits])('should recognize valid target %s', target => {
        expect(runCasing(target, 'kebab')).toBeUndefined();
      });

      describe('when digits are disallowed', () => {
        test.each([...invalid, ...validWithDigits])('should recognize invalid target %s', target => {
          expect(runCasing(target, 'kebab', true)).toEqual([{ message: 'must be kebab case' }]);
        });

        test.each(valid)('should recognize valid target %s', target => {
          expect(runCasing(target, 'kebab', true)).toBeUndefined();
        });
      });
    });

    describe('cobol', () => {
      const invalid = ['foo_test', 'Foo1', '123', 'fooBarBaz1', 'FOo', 'FOO-BAr', 'FOO--BAR', 'FOO-', '-FOO'];
      const valid = ['FOO', 'FOO-BAR', 'FOO-BAR-BAZ'];
      const validWithDigits = ['FOO-BAR1', 'FOO2-3BAR1'];

      test.each(invalid)('should recognize invalid target %s', target => {
        expect(runCasing(target, 'cobol')).toEqual([{ message: 'must be cobol case' }]);
      });

      test.each([...valid, ...validWithDigits])('should recognize valid target %s', target => {
        expect(runCasing(target, 'cobol')).toBeUndefined();
      });

      describe('when digits are disallowed', () => {
        test.each([...invalid, ...validWithDigits])('should recognize invalid target %s', target => {
          expect(runCasing(target, 'cobol', true)).toEqual([{ message: 'must be cobol case' }]);
        });

        test.each(valid)('should recognize valid target %s', target => {
          expect(runCasing(target, 'cobol', true)).toBeUndefined();
        });
      });
    });

    describe('snake', () => {
      const invalid = ['Foo1', '123', 'fooBarBaz1', 'FOo', 'FOO-BAR', 'foo__bar', '1foo_bar1', 'foo_', '_foo'];
      const valid = ['foo', 'foo_bar', 'foo_bar_baz'];
      const validWithDigits = ['foo_bar1', 'foo2_4bar1'];

      test.each(invalid)('should recognize invalid target %s', target => {
        expect(runCasing(target, 'snake')).toEqual([{ message: 'must be snake case' }]);
      });

      test.each([...valid, ...validWithDigits])('should recognize valid target %s', target => {
        expect(runCasing(target, 'snake')).toBeUndefined();
      });

      describe('when digits are disallowed', () => {
        test.each([...invalid, ...validWithDigits])('should recognize invalid target %s', target => {
          expect(runCasing(target, 'snake', true)).toEqual([{ message: 'must be snake case' }]);
        });

        test.each(valid)('should recognize valid target %s', target => {
          expect(runCasing(target, 'snake', true)).toBeUndefined();
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
        expect(runCasing(target, 'macro')).toEqual([{ message: 'must be macro case' }]);
      });

      test.each([...valid, ...validWithDigits])('should recognize valid target %s', target => {
        expect(runCasing(target, 'macro')).toBeUndefined();
      });

      describe('when digits are disallowed', () => {
        test.each([...invalid, ...validWithDigits])('should recognize invalid target %s', target => {
          expect(runCasing(target, 'macro', true)).toEqual([{ message: 'must be macro case' }]);
        });

        test.each(valid)('should recognize valid target %s', target => {
          expect(runCasing(target, 'macro', true)).toBeUndefined();
        });
      });
    });
  });
});

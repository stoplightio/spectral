import { ICasingOptions } from '../../types';
import { casing } from '../casing';

function runCasing(target: unknown, type: ICasingOptions['type']) {
  return casing(target, { type }, { given: ['$'] }, { given: null, original: null, resolved: {} as any });
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
      test.each(['foo_test', 'Foo', '123', 'foo1', 'foo-bar'])('should recognize invalid target %s', target => {
        expect(runCasing(target, 'flat')).toEqual([{ message: 'must be flat case' }]);
      });

      test.each(['foo', 'foobar'])('should recognize valid target %s', target => {
        expect(runCasing(target, 'flat')).toBeUndefined();
      });
    });

    describe('camel', () => {
      test.each(['foo_test', 'Foo', '123', 'fooBarBaz1', 'foo1', 'foo-bar'])(
        'should recognize invalid target %s',
        target => {
          expect(runCasing(target, 'camel')).toEqual([{ message: 'must be camel case' }]);
        },
      );

      test.each(['foo', 'fooBar', 'fooBarBaz'])('should recognize valid target %s', target => {
        expect(runCasing(target, 'camel')).toBeUndefined();
      });
    });

    describe('pascal', () => {
      test.each(['foo_test', 'Foo1', '123', 'fooBarBaz1', 'fooBar', 'foo1', 'foo-bar'])(
        'should recognize invalid target %s',
        target => {
          expect(runCasing(target, 'pascal')).toEqual([{ message: 'must be pascal case' }]);
        },
      );

      test.each(['Foo', 'FooBar', 'FooBarBaz'])('should recognize valid target %s', target => {
        expect(runCasing(target, 'pascal')).toBeUndefined();
      });
    });

    describe('kebab', () => {
      test.each([
        'foo_test',
        'Foo1',
        '123',
        'fooBarBaz1',
        'fooBar',
        'foO',
        'foo1',
        'foo-baR',
        'foo-bar1',
        'foo--bar',
        'foo-',
        '-foo',
      ])('should recognize invalid target %s', target => {
        expect(runCasing(target, 'kebab')).toEqual([{ message: 'must be kebab case' }]);
      });

      test.each(['foo', 'foo-bar', 'foo-bar-baz'])('should recognize valid target %s', target => {
        expect(runCasing(target, 'kebab')).toBeUndefined();
      });
    });

    describe('cobol', () => {
      test.each(['foo_test', 'Foo1', '123', 'fooBarBaz1', 'FOo', 'FOO-BAr', 'FOO--BAR', 'FOO-BAR1', 'FOO-', '-FOO'])(
        'should recognize invalid target %s',
        target => {
          expect(runCasing(target, 'cobol')).toEqual([{ message: 'must be cobol case' }]);
        },
      );

      test.each(['FOO', 'FOO-BAR', 'FOO-BAR-BAZ'])('should recognize valid target %s', target => {
        expect(runCasing(target, 'cobol')).toBeUndefined();
      });
    });

    describe('snake', () => {
      test.each(['Foo1', '123', 'fooBarBaz1', 'FOo', 'FOO-BAR', 'foo__bar', 'foo_bar1', 'foo_', '_foo'])(
        'should recognize invalid target %s',
        target => {
          expect(runCasing(target, 'snake')).toEqual([{ message: 'must be snake case' }]);
        },
      );

      test.each(['foo', 'foo_bar', 'foo_bar_baz'])('should recognize valid target %s', target => {
        expect(runCasing(target, 'snake')).toBeUndefined();
      });
    });

    describe('macro', () => {
      test.each(['foo_test', 'Foo1', '123', 'fooBarBaz1', 'FOo', 'FOO-BAR', 'FO__BAR', 'FOO_BAR1', 'FOO_', '_FOO'])(
        'should recognize invalid target %s',
        target => {
          expect(runCasing(target, 'macro')).toEqual([{ message: 'must be macro case' }]);
        },
      );

      test.each(['FOO', 'FOO_BAR', 'FOO_BAR_BAZ'])('should recognize valid target %s', target => {
        expect(runCasing(target, 'macro')).toBeUndefined();
      });
    });
  });
});

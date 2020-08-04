import { pattern } from '../pattern';

function runPattern(targetVal: any, options?: any) {
  return pattern.call(
    {
      cache: new Map(),
    },
    targetVal,
    options,
    {
      given: ['$'],
    },
    {
      given: null,
      original: null,
    } as any,
  );
}

describe('pattern', () => {
  describe('given a string regex', () => {
    test('should return empty array when given value matches the given match string regex without slashes', () => {
      expect(runPattern('abc', { match: '[abc]+' })).toBeUndefined();
    });

    test('should return empty array when given value matches the given match string regex with slashes', () => {
      expect(runPattern('abc', { match: '/[abc]+/' })).toBeUndefined();
    });

    test('should return empty array when given value matches the given match string regex with slashes and modifier', () => {
      expect(runPattern('aBc', { match: '/[abc]+/im' })).toBeUndefined();
    });

    test('should throw an exception when given string regex contains invalid flags', () => {
      expect(() => runPattern('aBc', { match: '/[abc]+/invalid' })).toThrow(
        "Invalid flags supplied to RegExp constructor 'invalid'",
      );
    });

    test('should return empty array when given value does not match the given notMatch string regex with slashes and modifier', () => {
      expect(runPattern('def', { notMatch: '/[abc]+/i' })).toBeUndefined();
    });
  });

  describe('given match and notMatch regexes', () => {
    test('should return empty array when given value match the given match and does not match the given notMatch regexes', () => {
      expect(runPattern('def', { match: /[def]+/, notMatch: /[abc]+/ })).toBeUndefined();
    });
  });
});

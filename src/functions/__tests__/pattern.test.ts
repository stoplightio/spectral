import { pattern } from '../pattern';

function runPattern(targetVal: any, options?: any) {
  return pattern(
    targetVal,
    options,
    {
      given: ['$'],
    },
    {
      given: null,
      original: null,
    },
  );
}

describe('pattern', () => {
  describe('given a true regex', () => {
    test('should return empty array when given value matches the given match regex', () => {
      expect(runPattern('abc', { match: /[abc]+/ })).toEqual([]);
    });

    test('should return a message when given value does not match the given notMatch regex', () => {
      expect(runPattern('def', { match: /[abc]+/ })).toEqual([{ message: "must match the pattern '/[abc]+/'" }]);
    });

    test('should return empty array when given value does not match the given notMatch regex', () => {
      expect(runPattern('dEf', { notMatch: /[abc]+/i })).toEqual([]);
    });

    test('should return a message when given value does match the given notMatch regex', () => {
      expect(runPattern('aBc', { notMatch: /[abc]+/i })).toEqual([
        { message: "must not match the pattern '/[abc]+/i'" },
      ]);
    });
  });

  describe('given a string regex', () => {
    test('should return empty array when given value matches the given match string regex without slashes', () => {
      expect(runPattern('abc', { match: '[abc]+' })).toEqual([]);
    });

    test('should return empty array when given value matches the given match string regex with slashes', () => {
      expect(runPattern('abc', { match: '/[abc]+/' })).toEqual([]);
    });

    test('should return empty array when given value matches the given match string regex with slashes and modifier', () => {
      expect(runPattern('aBc', { match: '/[abc]+/im' })).toEqual([]);
    });

    test('should return an array with a message when given value matches the given match string regex with slashes and modifier', () => {
      expect(runPattern('aBc', { match: '/[abc]+/izorglug' })).toEqual([
        { message: "must match the pattern '/[abc]+/izorglug'" },
      ]);
    });

    test('should return empty array when given value does not match the given notMatch string regex with slashes and modifier', () => {
      expect(runPattern('def', { notMatch: '/[abc]+/i' })).toEqual([]);
    });
  });

  describe('given match and notMatch regexes', () => {
    test('should return empty array when given value match the given match and does not match the given notMatch regexes', () => {
      expect(runPattern('def', { match: /[def]+/, notMatch: /[abc]+/ })).toEqual([]);
    });
  });
});

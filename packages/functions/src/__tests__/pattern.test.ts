import { RulesetValidationError } from '@stoplight/spectral-core';
import testFunction from './__helpers__/tester';
import pattern from '../pattern';

const runPattern = testFunction.bind(null, pattern);

describe('Core Functions / Pattern', () => {
  describe('given a string regex', () => {
    it('given value matching the given match string regex without slashes, should return no error message', async () => {
      expect(await runPattern('abc', { match: '[abc]+' })).toEqual([]);
    });

    it('given value matching the given match string regex with slashes, should return no error message', async () => {
      expect(await runPattern('abc', { match: '/[abc]+/' })).toEqual([]);
    });

    it('should return empty array when given value matches the given match string regex with slashes and modifier', async () => {
      expect(await runPattern('aBc', { match: '/[abc]+/im' })).toEqual([]);
    });

    it('given string regex containing invalid flags, should throw an exception', async () => {
      await expect(runPattern('aBc', { match: '/[abc]+/invalid' })).rejects.toThrow(
        "Invalid flags supplied to RegExp constructor 'invalid'",
      );
    });

    it('should return empty array when given value does not match the given notMatch string regex with slashes and modifier', async () => {
      expect(await runPattern('def', { notMatch: '/[abc]+/i' })).toEqual([]);
    });
  });

  describe('given match and notMatch regexes', () => {
    it('should return empty array when given value match the given match and does not match the given notMatch regexes', async () => {
      expect(await runPattern('def', { match: /[def]+/, notMatch: /[abc]+/ })).toEqual([]);
    });
  });

  describe('validation', () => {
    it.each([{ match: 'foo' }, { notMatch: 'foo' }, { match: 'foo', notMatch: 'bar' }])(
      'given valid %p options, should not throw',
      async opts => {
        expect(await runPattern('def', opts)).toBeInstanceOf(Array);
      },
    );

    it.each<[unknown, string]>([
      [
        null,
        '"pattern" function has invalid options specified. Example valid options: { "match": "^Stoplight" }, { "notMatch": "Swagger" }, { "match": "Stoplight", "notMatch": "Swagger" }',
      ],
      [
        {},
        `"pattern" function has invalid options specified. Example valid options: { "match": "^Stoplight" }, { "notMatch": "Swagger" }, { "match": "Stoplight", "notMatch": "Swagger" }`,
      ],
      [{ foo: true }, '"pattern" function does not support "foo" option'],
      [{ match: 2 }, '"pattern" function and its "match" option must be string or RegExp instance'],
      [{ notMatch: null }, '"pattern" function and its "notMatch" option must be string or RegExp instance'],
      [
        { match: 4, notMatch: 10 },
        `"pattern" function and its "match" option must be string or RegExp instance
"pattern" function and its "notMatch" option must be string or RegExp instance`,
      ],
    ])('given invalid %p options, should throw', async (opts, error) => {
      await expect(runPattern('abc', opts)).rejects.toThrow(new RulesetValidationError(error));
    });
  });
});

import * as Parsers from '@stoplight/spectral-parsers';
import { Document, RulesetValidationError } from '@stoplight/spectral-core';
import testFunction from './__helpers__/tester';
import alphabetical from '../alphabetical';

const runAlphabetical = testFunction.bind(null, alphabetical);

describe('Core Functions / Alphabetical', () => {
  it('given falsy target, should return no error message', async () => {
    expect(await runAlphabetical(false)).toEqual([]);
  });

  it('given single element target, should return no error message', async () => {
    expect(await runAlphabetical(['a'])).toEqual([]);
  });

  it('given an object and keys not in order, should return an error message', async () => {
    expect(
      await runAlphabetical({
        c: 2,
        b: 'xz',
      }),
    ).toEqual([
      {
        message: '"c" must be placed after "b"',
        path: ['c'],
      },
    ]);
  });

  it('given an object with unsorted properties with numeric keys, should return an error message', async () => {
    const doc = Parsers.Yaml.parse(`
'400':
  description: ''
'200':
  description: ''`).data;

    expect(await runAlphabetical(doc)).toEqual([
      {
        message: '"400" must be placed after "200"',
        path: ['400'],
      },
    ]);
  });

  describe('given NO keyedBy', () => {
    it('given an unsorted array of strings should return an error message', async () => {
      expect(await runAlphabetical(['b', 'a'])).toEqual([
        {
          message: '"b" must be placed after "a"',
          path: ['0'],
        },
      ]);
    });

    it('given a sorted array of strings, should return no error message ', async () => {
      expect(await runAlphabetical(['a', 'ab'])).toEqual([]);
    });

    it('given an unsorted array of numbers, should return an error message ', async () => {
      expect(await runAlphabetical([10, 1])).toEqual([
        {
          message: '10 must be placed after 1',
          path: ['0'],
        },
      ]);
    });

    it('given an array of objects should return an error', async () => {
      expect(await runAlphabetical([{ a: '10' }, { b: '1' }])).toEqual([
        {
          message: 'The document must be one of the allowed types: number, string',
          path: [],
        },
      ]);
    });

    it('given an array containing invalid values should return an error', async () => {
      expect(await runAlphabetical([false, 'a', null])).toEqual([
        {
          message: 'The document must be one of the allowed types: number, string',
          path: [],
        },
      ]);
    });
  });

  describe('given keyedBy', () => {
    it('given an array of objects with unsorted prop values should not return an error', async () => {
      expect(await runAlphabetical([{ a: '10' }, { a: '1' }], { keyedBy: 'a' })).toEqual([
        {
          message: 'properties must follow the alphabetical order',
          path: [],
        },
      ]);
    });

    it('given an array of objects with sorted prop values should not return an error', async () => {
      expect(await runAlphabetical([{ a: '1' }, { a: '2' }, { a: '2' }], { keyedBy: 'a' })).toEqual([]);
    });

    it('given an array of primitives, should return an error message ', async () => {
      expect(await runAlphabetical([100, 1], { keyedBy: 'a' })).toEqual([
        {
          message: 'The document must be an object',
          path: [],
        },
      ]);
    });
  });

  it('is able to trap object again', async () => {
    const document = new Document(`'404':\n'200':`, Parsers.Yaml);

    Object.defineProperty(document, 'data', {
      value: Object.defineProperties({}, Object.getOwnPropertyDescriptors(document.data)),
    });

    expect(await runAlphabetical(document)).toEqual([
      {
        message: '"404" must be placed after "200"',
        path: ['404'],
      },
    ]);
  });

  describe('validation', () => {
    it.each([null, {}, { keyedBy: 'bar' }])('given valid %p options, should not throw', async opts => {
      expect(await runAlphabetical([], opts)).toEqual([]);
    });

    it.each<[unknown, string]>([
      [{ foo: true }, '"alphabetical" function does not support "foo" option'],
      [
        2,
        '"alphabetical" function has invalid options specified. Example valid options: null (no options), { "keyedBy": "my-key" }',
      ],
      [{ keyedBy: 2 }, '"alphabetical" function and its "keyedBy" option accepts only the following types: string'],
    ])('given invalid %p options, should throw', async (opts, error) => {
      await expect(runAlphabetical([], opts)).rejects.toThrow(new RulesetValidationError(error));
    });
  });
});

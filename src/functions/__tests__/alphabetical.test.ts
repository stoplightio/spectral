import { safeStringify } from '@stoplight/json';
import { Parsers } from '../../';
import { Document } from '../../document';
import { DocumentInventory } from '../../documentInventory';
import { parseYaml } from '../../parsers';
import { alphabetical } from '../alphabetical';

function runAlphabetical(target: any, keyedBy?: string) {
  return alphabetical(
    target,
    { keyedBy },
    { given: ['$'] },
    {
      given: null,
      original: null,
      documentInventory: new DocumentInventory(new Document(safeStringify(target), Parsers.Json), {} as any),
    },
  );
}

describe('alphabetical', () => {
  test('given falsy target should return empty array', () => {
    expect(runAlphabetical(false)).toEqual([]);
  });

  test('given single element target should return empty array', () => {
    expect(runAlphabetical(['a'])).toEqual([]);
  });

  test('given an object and keys not in order return an error message', () => {
    expect(
      runAlphabetical({
        c: 2,
        b: 'xz',
      }),
    ).toEqual([
      {
        message: 'at least 2 properties are not in alphabetical order: "c" should be placed after "b"',
        path: ['$', 'c'],
      },
    ]);
  });

  test('given an object with unsorted properties with numeric keys', () => {
    const doc = parseYaml(`
'400':
  description: ''
'200':
  description: ''`).data;

    expect(runAlphabetical(doc)).toEqual([
      {
        message: 'at least 2 properties are not in alphabetical order: "400" should be placed after "200"',
        path: ['$', '400'],
      },
    ]);
  });

  describe('given NO keyedBy', () => {
    test('given an unsorted array of strings should return error', () => {
      expect(runAlphabetical(['b', 'a'])).toEqual([
        {
          message: 'at least 2 properties are not in alphabetical order: "b" should be placed after "a"',
          path: ['$', 0],
        },
      ]);
    });

    test('given a sorted array of strings should NOT return error', () => {
      expect(runAlphabetical(['a', 'ab'])).toEqual([]);
    });

    test('given an unsorted array of numbers should return error', () => {
      expect(runAlphabetical([10, 1])).toEqual([
        {
          message: 'at least 2 properties are not in alphabetical order: "10" should be placed after "1"',
          path: ['$', 0],
        },
      ]);
    });

    test('given an array of objects should NOT return an error', () => {
      expect(runAlphabetical([{ a: '10' }, { b: '1' }])).toEqual([]);
    });
  });

  describe('given keyedBy', () => {
    test('given an array of objects with unsorted prop values return an error', () => {
      expect(runAlphabetical([{ a: '10' }, { a: '1' }], 'a')).toEqual([
        {
          message: 'properties are not in alphabetical order',
        },
      ]);
    });

    test('given an array of objects with sorted prop values to NOT return an error', () => {
      expect(runAlphabetical([{ a: '1' }, { a: '2' }, { a: '2' }], 'a')).toEqual([]);
    });

    test('given an array primitives should not return error', () => {
      expect(runAlphabetical([100, 1], 'a')).toEqual([]);
    });
  });

  test('is able to trap object again', () => {
    const document = new Document(`'404':\n'200':`, Parsers.Yaml);

    Object.defineProperty(document, 'data', {
      value: Object.defineProperties({}, Object.getOwnPropertyDescriptors(document.data)),
    });

    expect(
      alphabetical(
        document.data,
        {},
        { given: ['$'] },
        {
          given: null,
          original: null,
          documentInventory: new DocumentInventory(document, {} as any),
        },
      ),
    ).toEqual([
      {
        message: 'at least 2 properties are not in alphabetical order: "404" should be placed after "200"',
        path: ['$', '404'],
      },
    ]);
  });
});

import { alphabetical } from '../alphabetical';

function runAlphabetical(target: any, keyedBy?: string) {
  return alphabetical(target, { keyedBy }, { given: ['$'] }, { given: null, original: null });
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
      })
    ).toMatchInlineSnapshot(`
Array [
  Object {
    "message": "properties are not in alphabetical order",
  },
]
`);
  });

  describe('given NO keyedBy', () => {
    test('given an unsorted array of strings should return error', () => {
      expect(runAlphabetical(['b', 'a'])).toMatchInlineSnapshot(`
Array [
  Object {
    "message": "properties are not in alphabetical order",
  },
]
`);
    });

    test('given a sorted array of strings should NOT return error', () => {
      expect(runAlphabetical(['a', 'ab'])).toEqual([]);
    });

    test('given an unsorted array of numbers should return error', () => {
      expect(runAlphabetical([10, 1])).toMatchInlineSnapshot(`
Array [
  Object {
    "message": "properties are not in alphabetical order",
  },
]
`);
    });

    test('given an unsorted array of numbers should return error', () => {
      expect(runAlphabetical([10, 1])).toMatchInlineSnapshot(`
Array [
  Object {
    "message": "properties are not in alphabetical order",
  },
]
`);
    });

    test('given an array of objects should NOT return an error', () => {
      expect(runAlphabetical([{ a: '10' }, { b: '1' }])).toMatchInlineSnapshot(`Array []`);
    });
  });

  describe('given keyedBy', () => {
    test('given an array of objects with unsorted prop values return an error', () => {
      expect(runAlphabetical([{ a: '10' }, { a: '1' }], 'a')).toMatchInlineSnapshot(`
Array [
  Object {
    "message": "properties are not in alphabetical order",
  },
]
`);
    });

    test('given an array of objects with sorted prop values to NOT return an error', () => {
      expect(runAlphabetical([{ a: '1' }, { a: '2' }, { a: '2' }], 'a')).toEqual([]);
    });

    test('given an array primitives should not return error', () => {
      expect(runAlphabetical([100, 1], 'a')).toEqual([]);
    });
  });
});

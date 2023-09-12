import { getRedundantProps } from '../getRedundantProps';

describe('getRedundantProps', () => {
  test('should return all redundant props when array is empty', () => {
    const result = getRedundantProps([], ['one', 'two', 'three']);
    expect(result).toEqual(['one', 'two', 'three']);
  });

  test('should return only redundant props', () => {
    const result = getRedundantProps(['one', 'three'], ['one', 'two', 'three']);
    expect(result).toEqual(['two']);
  });

  test('should return empty array when all props are defined', () => {
    const result = getRedundantProps(['one', 'two', 'three'], ['one', 'two', 'three']);
    expect(result).toEqual([]);
  });
});

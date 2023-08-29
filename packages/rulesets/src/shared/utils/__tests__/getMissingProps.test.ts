import { getMissingProps } from '../getMissingProps';

describe('getMissingProps', () => {
  test('should return all props when object is empty', () => {
    const result = getMissingProps(['one', 'two', 'three'], []);
    expect(result).toEqual(['one', 'two', 'three']);
  });

  test('should return only missed props', () => {
    const result = getMissingProps(['one', 'two', 'three'], ['one', 'three']);
    expect(result).toEqual(['two']);
  });

  test('should return empty array when all props are defined', () => {
    const result = getMissingProps(['one', 'two', 'three'], ['one', 'two', 'three']);
    expect(result).toEqual([]);
  });
});

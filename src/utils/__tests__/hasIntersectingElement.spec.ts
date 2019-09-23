import { hasIntersectingElement } from '../hasIntersectingElement';

describe('hasIntersectingElement util', () => {
  it('returns true if intersecting element is found', () => {
    expect(hasIntersectingElement([1, 0], [0])).toBe(true);
    expect(hasIntersectingElement(['a', 'b', 'c', 'd'], ['c', 'a', 'b', 'c'])).toBe(true);
    const obj = {};
    expect(hasIntersectingElement([{}, obj], [obj])).toBe(true);
    expect(hasIntersectingElement([NaN], [NaN])).toBe(true);
  });

  it('returns false if intersecting element cannot be found', () => {
    expect(hasIntersectingElement([1, 0], [2])).toBe(false);
    expect(hasIntersectingElement(['a', 'b', 'c', 'd'], ['e', 'f', 'g'])).toBe(false);
    expect(hasIntersectingElement([{}], [{}])).toBe(false);
  });

  it('returns false if any set is empty', () => {
    expect(hasIntersectingElement([0], [])).toBe(false);
    expect(hasIntersectingElement([], [1])).toBe(false);
  });

  it('returns false for empty sets', () => {
    expect(hasIntersectingElement([], [])).toBe(false);
  });
});

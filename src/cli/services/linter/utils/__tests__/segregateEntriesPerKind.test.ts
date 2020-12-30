import { segregateEntriesPerKind } from '../segregateEntriesPerKind';

describe('segregateEntriesPerKind', () => {
  it('can operate on empty arrays', () => {
    expect(segregateEntriesPerKind([])).toEqual([[], []]);
  });

  it('returns strings in first output', () => {
    expect(segregateEntriesPerKind(['a', 'b'])).toEqual([['a', 'b'], []]);
  });

  it('returns numbers in second output', () => {
    expect(segregateEntriesPerKind([1, 2])).toEqual([[], [1, 2]]);
  });

  it('splits entries in proper outputs', () => {
    expect(segregateEntriesPerKind(['a', 'b', 1, 'd', 2, 'e'])).toEqual([
      ['a', 'b', 'd', 'e'],
      [1, 2],
    ]);
  });
});

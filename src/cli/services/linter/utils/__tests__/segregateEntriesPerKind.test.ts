import { segregateEntriesPerKind } from '../segregateEntriesPerKind';

describe('segregateEntriesPerKind', () => {
  it('can operate on empty arrays', () => {
    expect(segregateEntriesPerKind([])).toEqual([[], []]);
  });

  it('return strings in first output', () => {
    expect(segregateEntriesPerKind(['a', 'b'])).toEqual([['a', 'b'], []]);
  });

  it('return numbers in second output', () => {
    expect(segregateEntriesPerKind([1, 2])).toEqual([[], [1, 2]]);
  });

  it('split entries in proper outputs', () => {
    expect(segregateEntriesPerKind(['a', 'b', 1, 'd', 2, 'e'])).toEqual([
      ['a', 'b', 'd', 'e'],
      [1, 2],
    ]);
  });
});

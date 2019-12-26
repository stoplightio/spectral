import { DiagnosticSeverity } from '@stoplight/types';
import { IRuleResult } from '../../types';
import { compareResults, sortResults } from '../sortResults';

const results: IRuleResult[] = [
  {
    code: 'code 01',
    path: ['a', 'b', 'c', 'd'],
    source: 'source 01',
    range: {
      start: { line: 1, character: 1 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 01',
    path: ['a', 'b', 'c', 'd'],
    source: 'source 02',
    range: {
      start: { line: 1, character: 1 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 01',
    path: ['a', 'b', 'c', 'd'],
    source: 'source 02',
    range: {
      start: { line: 2, character: 1 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 01',
    path: ['a', 'b', 'c', 'd'],
    source: 'source 02',
    range: {
      start: { line: 2, character: 2 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 02',
    path: ['a', 'b', 'c', 'd'],
    source: 'source 02',
    range: {
      start: { line: 2, character: 2 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 02',
    path: ['a', 'b', 'c', 'e'],
    source: 'source 02',
    range: {
      start: { line: 2, character: 2 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 02',
    path: ['a', 'b', 'c', 'f'],
    source: 'source 02',
    range: {
      start: { line: 2, character: 2 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 03',
    path: ['a', 'b', 'c', 'f'],
    source: 'source 02',
    range: {
      start: { line: 2, character: 2 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 03',
    path: ['a', 'b', 'c', 'f'],
    source: 'source 02',
    range: {
      start: { line: 2, character: 3 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 03',
    path: ['a', 'b', 'c', 'f'],
    source: 'source 02',
    range: {
      start: { line: 3, character: 3 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
  {
    code: 'code 03',
    path: ['a', 'b', 'c', 'f'],
    source: 'source 03',
    range: {
      start: { line: 3, character: 3 },
      end: { line: 99, character: 99 },
    },
    message: '99',
    severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
  },
];

describe('sortResults', () => {
  const shuffleBy = (arr: IRuleResult[], indices: number[]): IRuleResult[] => {
    expect(indices).toHaveLength(arr.length);

    const shuffled = results
      .map((v, i) => ({ ...v, pos: indices[i] }))
      .sort((a, b) => a.pos - b.pos)
      .map((v, i) => {
        delete v.pos;
        return v;
      });

    return shuffled;
  };

  test('should properly order results', () => {
    const randomlySortedIndices = [5, 4, 1, 10, 8, 6, 3, 9, 2, 0, 7];

    const shuffled = shuffleBy(results, randomlySortedIndices);

    expect(sortResults(shuffled)).toEqual(results);
  });
});

describe('compareResults', () => {
  test('should properly order results source', () => {
    const input = {
      code: 'code 01',
      path: ['a', 'b', 'c', 'd'],
      range: {
        start: { line: 1, character: 1 },
        end: { line: 99, character: 99 },
      },
      message: '99',
      severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
    };

    [
      { one: undefined, another: undefined, expected: 0 },
      { one: 'a', another: undefined, expected: 1 },
      { one: undefined, another: 'a', expected: -1 },
      { one: 'a', another: 'a', expected: 0 },
      { one: 'a', another: 'b', expected: -1 },
    ].forEach(tc => {
      expect(compareResults({ ...input, source: tc.one }, { ...input, source: tc.another })).toEqual(tc.expected);
    });
  });

  test('should properly order results code', () => {
    const input = {
      source: 'somewhere',
      path: ['a', 'b', 'c', 'd'],
      range: {
        start: { line: 1, character: 1 },
        end: { line: 99, character: 99 },
      },
      message: '99',
      severity: DiagnosticSeverity.Error, // or any other level, it's irrelevant
    };

    [
      { one: undefined, another: undefined, expected: 0 },
      { one: 'a', another: undefined, expected: 1 },
      { one: undefined, another: 'a', expected: -1 },
      { one: 'a', another: 'a', expected: 0 },
      { one: 'a', another: 'b', expected: -1 },
      { one: '2', another: '10', expected: -1 },
      { one: 1, another: undefined, expected: 1 },
      { one: undefined, another: 1, expected: -1 },
      { one: 1, another: 1, expected: 0 },
      { one: 1, another: 2, expected: -1 },
      { one: 1, another: '1', expected: 0 },
      { one: 2, another: '10', expected: -1 },
    ].forEach(tc => {
      expect(compareResults({ ...input, code: tc.one }, { ...input, code: tc.another })).toEqual(tc.expected);
    });
  });
});

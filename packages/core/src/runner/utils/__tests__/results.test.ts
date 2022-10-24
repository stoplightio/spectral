import { prepareResults } from '../results';
import { DiagnosticSeverity, IPosition } from '@stoplight/types';

import { comparePosition, compareResults, sortResults } from '../results';
import type { ISpectralDiagnostic } from '../../../types';

import duplicateValidationResults from './__fixtures__/duplicate-validation-results.json';
import { results } from './__fixtures__/random-results';

describe('prepareResults util', () => {
  it('deduplicate exact validation results', () => {
    expect(prepareResults(duplicateValidationResults)).toEqual([
      expect.objectContaining({
        code: 'valid-example-in-schemas',
      }),
      expect.objectContaining({
        code: 'valid-schema-example-in-content',
      }),
    ]);
  });

  it('deduplicate exact validation results with unknown source', () => {
    const duplicateValidationResultsWithNoSource = duplicateValidationResults.map(result => ({
      ...result,
      source: void 0,
    }));

    expect(prepareResults(duplicateValidationResultsWithNoSource)).toEqual([
      expect.objectContaining({
        code: 'valid-example-in-schemas',
      }),
      expect.objectContaining({
        code: 'valid-schema-example-in-content',
      }),
    ]);
  });

  it('deduplicate list of only duplicates', () => {
    const onlyDuplicates = [
      { ...duplicateValidationResults[0] },
      { ...duplicateValidationResults[0] },
      { ...duplicateValidationResults[0] },
      { ...duplicateValidationResults[0] },
    ];

    expect(prepareResults(onlyDuplicates).length).toBe(1);
  });

  it('deduplicate only exact validation results', () => {
    // verifies that results with the same code/path but different messages will not be de-duplicated
    expect(prepareResults(duplicateValidationResults)).toEqual([
      expect.objectContaining({
        code: 'valid-example-in-schemas',
      }),
      expect.objectContaining({
        code: 'valid-schema-example-in-content',
      }),
    ]);
  });
});

describe('sortResults', () => {
  const shuffleBy = (arr: ISpectralDiagnostic[], indices: number[]): ISpectralDiagnostic[] => {
    expect(indices).toHaveLength(arr.length);

    const shuffled = results
      .map<ISpectralDiagnostic & { pos?: number }>((v, i) => ({ ...v, pos: indices[i] }))
      .sort((a, b) => a.pos! - b.pos!)
      .map(v => {
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
      { one: void 0, another: void 0, expected: 0 },
      { one: 'a', another: void 0, expected: 1 },
      { one: void 0, another: 'a', expected: -1 },
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
      { one: 'a', another: 'a', expected: 0 },
      { one: 'a', another: 'b', expected: -1 },
      { one: '2', another: '10', expected: -1 },
      { one: 1, another: 1, expected: 0 },
      { one: 1, another: 2, expected: -1 },
      { one: 1, another: '1', expected: 0 },
      { one: 2, another: '10', expected: -1 },
    ].forEach(tc => {
      expect(compareResults({ ...input, code: tc.one }, { ...input, code: tc.another })).toEqual(tc.expected);
    });
  });
});

const buildPosition = (line: number, char: number): IPosition => {
  return { line, character: char };
};

describe('comparePosition', () => {
  const positionTestCases = [
    [2, 2, 1, 1, 1],
    [2, 1, 1, 1, 1],
    [1, 2, 1, 1, 1],

    [1, 1, 1, 1, 0],
    [1, 2, 1, 2, 0],
    [2, 1, 2, 1, 0],
    [2, 2, 2, 2, 0],

    [1, 1, 1, 2, -1],
    [1, 1, 2, 1, -1],
    [1, 1, 2, 2, -1],
  ];

  test.each(positionTestCases)(
    'should properly order locations (%i, %i) vs (%i, %i)',
    (leftLine, leftChar, rightLine, rightChar, expected) => {
      expect(comparePosition(buildPosition(leftLine, leftChar), buildPosition(rightLine, rightChar))).toEqual(expected);
    },
  );
});

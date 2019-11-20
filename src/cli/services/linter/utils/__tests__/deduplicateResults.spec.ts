import { deduplicateResults } from '../deduplicateResults';

import * as duplicateValidationResults from './__fixtures__/duplicate-validation-results.json';

describe('deduplicateResults util', () => {
  it('deduplicate exact validation results', () => {
    expect(deduplicateResults(duplicateValidationResults)).toEqual([
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

    expect(deduplicateResults(duplicateValidationResultsWithNoSource)).toEqual([
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

    expect(deduplicateResults(onlyDuplicates).length).toBe(1);
  });
});

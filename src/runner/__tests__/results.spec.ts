import { Results } from '../results';
import { IRuleResult } from '../../types';

import * as duplicateValidationResults from './__fixtures__/duplicate-validation-results.json';
import * as sortedValidationResults from './__fixtures__/sorted-validation-results.json';

describe('Results', () => {
  let results: Results;

  beforeEach(() => {
    results = new Results({} as any);
  });

  describe('deduplication', () => {
    it('deduplicate exact validation results', () => {
      results.push(...duplicateValidationResults);

      expect([...results]).toEqual([
        expect.objectContaining({
          code: 'valid-schema-example-in-content',
        }),
        expect.objectContaining({
          code: 'valid-example-in-schemas',
        }),
      ]);
    });

    it('deduplicate exact validation results with unknown source', () => {
      results.push(
        ...duplicateValidationResults.map(result => ({
          ...(result as IRuleResult),
          source: void 0,
        })),
      );

      expect([...results]).toEqual([
        expect.objectContaining({
          code: 'valid-schema-example-in-content',
        }),
        expect.objectContaining({
          code: 'valid-example-in-schemas',
        }),
      ]);
    });

    it('deduplicate list of only duplicates', () => {
      const onlyDuplicates = [...new Array(4)].map(() => ({ ...duplicateValidationResults[0] } as IRuleResult));

      results.push(...onlyDuplicates);

      expect(results).toHaveLength(1);
    });
  });

  describe('sorting', () => {
    test('should properly order results', () => {
      results.push(...[5, 4, 1, 10, 8, 6, 3, 9, 2, 0, 7].map(i => sortedValidationResults[i]));
      results.sort();

      expect(results.slice()).toEqual(sortedValidationResults);
    });
  });
});

import { compareResults } from '../../../../formatters/utils/sortResults';
import { IRuleResult } from '../../../../types';

export const deduplicateResults = (results: IRuleResult[]): IRuleResult[] => {
  const filtered: IRuleResult[] = [];

  const totalResults = results.length;

  if (totalResults < 2) {
    return [...results];
  }

  const sorted = [...results].sort(compareResults);

  filtered.push(sorted[0]);

  for (let i = 1; i < totalResults; i++) {
    if (compareResults(sorted[i], sorted[i - 1]) === 0) {
      continue;
    }

    filtered.push(sorted[i]);
  }

  return filtered;
};

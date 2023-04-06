import { IRuleResult } from '@stoplight/spectral-core';

export const getUniqueErrors = (results: IRuleResult[]): IRuleResult[] => {
  const filteredResults: IRuleResult[] = [];
  results.forEach((result: IRuleResult) => {
    if (
      !filteredResults.some(
        (element: IRuleResult) => element.code === result.code && element.message === result.message,
      )
    ) {
      filteredResults.push(result);
    }
  });

  return filteredResults;
};

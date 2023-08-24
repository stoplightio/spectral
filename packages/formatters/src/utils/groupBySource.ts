import { Dictionary } from '@stoplight/types';
import type { IRuleResult } from '@stoplight/spectral-core';

export const groupBySource = (results: IRuleResult[]): Dictionary<IRuleResult[]> => {
  return results.reduce<Dictionary<IRuleResult[]>>((grouped, result) => {
    if (result.source !== void 0) {
      (grouped[result.source] = grouped[result.source] ?? []).push(result);
    }
    return grouped;
  }, {});
};

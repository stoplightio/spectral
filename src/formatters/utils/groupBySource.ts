import { Dictionary } from '@stoplight/types';
import { IRuleResult } from '../../types';

export const groupBySource = (results: IRuleResult[]): Dictionary<IRuleResult[]> => {
  return results.reduce<Dictionary<IRuleResult[]>>((grouped, result) => {
    (grouped[result.source!] = grouped[result.source!] || []).push(result);
    return grouped;
  }, {});
};

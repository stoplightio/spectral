import { IRuleResult } from '../types';

export const json = (results: IRuleResult[]): string => {
  const outputJson = results.map(result => {
    return {
      code: result.code,
      path: result.path,
      message: result.message,
      severity: result.severity,
    };
  });
  return JSON.stringify(outputJson, null, '\t');
};

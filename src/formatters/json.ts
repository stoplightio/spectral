import { IRuleResult } from '../types';

export const json = (results: IRuleResult[]): string => {
  const outputJson = results.map(result => {
    return {
      code: result.code,
      path: result.path,
      message: result.message,
      summary: result.summary,
      severity: result.severity,
      range: result.range,
    };
  });
  return JSON.stringify(outputJson, null, '\t');
};

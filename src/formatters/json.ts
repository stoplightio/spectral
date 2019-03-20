import { IRuleResult } from '../types';

export const json = (results: IRuleResult[]): string => {
  const outputJson = results.map(result => {
    return {
      description: result.description,
      location: result.location,
      path: result.path,
      message: result.message,
      name: result.name,
      severity: result.severity,
      severityLabel: result.severityLabel,
    };
  });
  return JSON.stringify(outputJson, null, '\t');
};

import { Formatter } from './types';

export const json: Formatter = results => {
  const outputJson = results.map(result => {
    return {
      code: result.code,
      path: result.path,
      message: result.message,
      severity: result.severity,
      range: result.range,
      source: result.source,
    };
  });
  return JSON.stringify(outputJson, null, '\t');
};

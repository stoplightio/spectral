import { Formatter } from './types';

export const json: Formatter = results => {
  const outputJson = results.map(result => {
    let documentationUrlObject = {};
    if (result.documentationUrl) {
      documentationUrlObject = {
        documentationUrl: result.documentationUrl,
      };
    }
    return {
      code: result.code,
      path: result.path,
      message: result.message,
      severity: result.severity,
      range: result.range,
      source: result.source,
      ...documentationUrlObject,
    };
  });
  return JSON.stringify(outputJson, null, '\t');
};

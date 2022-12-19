import { ISpectralDiagnostic } from '@stoplight/spectral-core';
import { Formatter, FormatterOptions } from './types';

import { groupBySource, getUniqueErrors, getCountsBySeverity, getScoringText } from './utils';

export const json: Formatter = (results: ISpectralDiagnostic[], options: FormatterOptions) => {
  let groupedResults;
  let scoringText = '';
  if (options.scoringConfig !== void 0) {
    groupedResults = groupBySource(getUniqueErrors(results));
    scoringText = getScoringText(getCountsBySeverity(groupedResults), options.scoringConfig);
  }
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
  let objectOutput;
  if (options.scoringConfig !== void 0) {
    const scoring = +(scoringText !== null ? scoringText.replace('%', '').split(/[()]+/)[1] : 0);
    objectOutput = {
      scoring: scoringText.replace('SCORING:', '').trim(),
      passed: scoring >= options.scoringConfig.threshold,
      results: outputJson,
    };
  } else {
    objectOutput = outputJson;
  }
  return JSON.stringify(objectOutput, null, '\t');
};

import { IRuleResult } from '@stoplight/spectral-core';
import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { groupBySeverity } from './groupBySeverity';

export const getCountsBySeverity = (
  groupedResults: Dictionary<IRuleResult[]>,
): {
  [DiagnosticSeverity.Error]: number;
  [DiagnosticSeverity.Warning]: number;
  [DiagnosticSeverity.Information]: number;
  [DiagnosticSeverity.Hint]: number;
} => {
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  let hintCount = 0;

  for (const results of Object.values(groupedResults)) {
    const {
      [DiagnosticSeverity.Error]: errors,
      [DiagnosticSeverity.Warning]: warnings,
      [DiagnosticSeverity.Information]: infos,
      [DiagnosticSeverity.Hint]: hints,
    } = groupBySeverity(results);

    errorCount += errors.length;
    warningCount += warnings.length;
    infoCount += infos.length;
    hintCount += hints.length;
  }

  return {
    [DiagnosticSeverity.Error]: errorCount,
    [DiagnosticSeverity.Warning]: warningCount,
    [DiagnosticSeverity.Information]: infoCount,
    [DiagnosticSeverity.Hint]: hintCount,
  };
};

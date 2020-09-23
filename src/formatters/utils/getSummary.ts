import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { IRuleResult } from '../../types';
import { groupBySeverity } from './groupBySeverity';
import { pluralize } from './pluralize';

const printSummary = ({
  errors,
  warnings,
  infos,
  hints,
}: {
  errors: number;
  warnings: number;
  infos: number;
  hints: number;
}): string | null => {
  const total = errors + warnings + infos + hints;
  if (total === 0) {
    return null;
  }

  return [
    total,
    pluralize(' problem', total),
    ' (',
    errors,
    pluralize(' error', errors),
    ', ',
    warnings,
    pluralize(' warning', warnings),
    ', ',
    infos,
    pluralize(' info', infos),
    ', ',
    hints,
    pluralize(' hint', hints),
    ')',
  ].join('');
};

export const getSummaryForSource = (results: IRuleResult[]): string | null => {
  const {
    [DiagnosticSeverity.Error]: { length: errors },
    [DiagnosticSeverity.Warning]: { length: warnings },
    [DiagnosticSeverity.Information]: { length: infos },
    [DiagnosticSeverity.Hint]: { length: hints },
  } = groupBySeverity(results);

  return printSummary({
    errors,
    warnings,
    infos,
    hints,
  });
};

export const getSummary = (groupedResults: Dictionary<IRuleResult[]>): string | null => {
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

  return printSummary({
    errors: errorCount,
    warnings: warningCount,
    infos: infoCount,
    hints: hintCount,
  });
};

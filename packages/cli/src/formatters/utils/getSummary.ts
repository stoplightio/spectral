import { CustomDiagnosticSeverity } from '@iso20022/custom-rulesets';
import { IRuleResult } from '@stoplight/spectral-core';
import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { groupBySeverity } from './groupBySeverity';
import { pluralize } from './pluralize';

const printSummary = ({
  errors,
  warnings,
  infos,
  hints,
  warningMajors,
  warningMinors,
  criticals,
}: {
  errors: number;
  warnings: number;
  infos: number;
  hints: number;
  warningMajors: number;
  warningMinors: number;
  criticals: number;
}): string | null => {
  const total = criticals + errors + warningMajors + warnings + warningMinors + infos + hints;
  if (total === 0) {
    return null;
  }

  return [
    total,
    pluralize(' problem', total),
    ' (',
    criticals,
    pluralize(' critical', criticals),
    ', ',
    errors,
    pluralize(' error', errors),
    ', ',
    warningMajors,
    pluralize(' warning major', warningMajors),
    ', ',
    warnings,
    pluralize(' warning', warnings),
    ', ',
    warningMinors,
    pluralize(' warning minor', warningMinors),
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
    [CustomDiagnosticSeverity.WARNINGMAYOR]: { length: warningMajors },
    [CustomDiagnosticSeverity.WARNINGMINOR]: { length: warningMinors },
    [CustomDiagnosticSeverity.CRITICAL]: { length: criticals },
  } = groupBySeverity(results);

  return printSummary({
    errors,
    warnings,
    infos,
    hints,
    warningMajors,
    warningMinors,
    criticals,
  });
};

export const getSummary = (groupedResults: Dictionary<IRuleResult[]>): string | null => {
  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  let hintCount = 0;
  let warningMinorCount = 0;
  let warningMajorCount = 0;
  let criticalCount = 0;

  for (const results of Object.values(groupedResults)) {
    const {
      [DiagnosticSeverity.Error]: errors,
      [DiagnosticSeverity.Warning]: warnings,
      [DiagnosticSeverity.Information]: infos,
      [DiagnosticSeverity.Hint]: hints,
      [CustomDiagnosticSeverity.WARNINGMAYOR]: warningMajors,
      [CustomDiagnosticSeverity.WARNINGMINOR]: warningMinors,
      [CustomDiagnosticSeverity.CRITICAL]: criticals,
    } = groupBySeverity(results);

    errorCount += errors.length;
    warningCount += warnings.length;
    infoCount += infos.length;
    hintCount += hints.length;
    warningMinorCount += warningMajors.length;
    warningMajorCount += warningMinors.length;
    criticalCount += criticals.length;
  }

  return printSummary({
    errors: errorCount,
    warnings: warningCount,
    infos: infoCount,
    hints: hintCount,
    warningMajors: warningMinorCount,
    warningMinors: warningMajorCount,
    criticals: criticalCount,
  });
};

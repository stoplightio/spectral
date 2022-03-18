import { CustomDiagnosticSeverity } from '@iso20022/custom-rulesets';
import type { IRuleResult } from '@stoplight/spectral-core';
import { DiagnosticSeverity, Dictionary } from '@stoplight/types';

export const groupBySeverity = (
  results: IRuleResult[],
): Dictionary<IRuleResult[], DiagnosticSeverity | CustomDiagnosticSeverity> =>
  results.reduce<Dictionary<IRuleResult[], DiagnosticSeverity | CustomDiagnosticSeverity>>(
    (group, result: IRuleResult) => {
      group[result.severity].push(result);
      return group;
    },
    {
      [DiagnosticSeverity.Error]: [],
      [DiagnosticSeverity.Warning]: [],
      [DiagnosticSeverity.Hint]: [],
      [DiagnosticSeverity.Information]: [],
      [CustomDiagnosticSeverity.CRITICAL]: [],
      [CustomDiagnosticSeverity.WARNINGMAYOR]: [],
      [CustomDiagnosticSeverity.WARNINGMINOR]: [],
    },
  );

import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import type { IRuleResult } from '@stoplight/spectral-core';

export const groupBySeverity = (results: IRuleResult[]): Dictionary<IRuleResult[], DiagnosticSeverity> =>
  results.reduce<Dictionary<IRuleResult[], DiagnosticSeverity>>(
    (group, result: IRuleResult) => {
      group[result.severity].push(result);
      return group;
    },
    {
      [DiagnosticSeverity.Error]: [],
      [DiagnosticSeverity.Warning]: [],
      [DiagnosticSeverity.Hint]: [],
      [DiagnosticSeverity.Information]: [],
    },
  );

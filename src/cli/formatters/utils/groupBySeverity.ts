import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { IRuleResult } from '../../../types';

export const groupBySeverity = (results: IRuleResult[]) =>
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

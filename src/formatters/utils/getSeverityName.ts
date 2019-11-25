import { DiagnosticSeverity, Dictionary } from '@stoplight/types';

const SEVERITY_NAMES: Dictionary<string, DiagnosticSeverity> = {
  [DiagnosticSeverity.Error]: 'error',
  [DiagnosticSeverity.Warning]: 'warning',
  [DiagnosticSeverity.Information]: 'information',
  [DiagnosticSeverity.Hint]: 'hint',
};

export function getSeverityName(severity: DiagnosticSeverity) {
  return SEVERITY_NAMES[severity];
}

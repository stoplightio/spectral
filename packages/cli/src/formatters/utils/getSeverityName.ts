import { CustomDiagnosticSeverity, CUSTOM_SEVERITY_NAMES } from '@iso20022/custom-rulesets';
import { DiagnosticSeverity, Dictionary } from '@stoplight/types';

const SEVERITY_NAMES: Dictionary<string, DiagnosticSeverity> = {
  [DiagnosticSeverity.Error]: 'error',
  [DiagnosticSeverity.Warning]: 'warning',
  [DiagnosticSeverity.Information]: 'information',
  [DiagnosticSeverity.Hint]: 'hint',
};

const EXTENDED_SEVERITY_NAMES: Dictionary<string, DiagnosticSeverity | CustomDiagnosticSeverity> = {
  ...SEVERITY_NAMES,
  ...CUSTOM_SEVERITY_NAMES,
};

export function getSeverityName(severity: DiagnosticSeverity | CustomDiagnosticSeverity): string {
  return EXTENDED_SEVERITY_NAMES[severity];
}

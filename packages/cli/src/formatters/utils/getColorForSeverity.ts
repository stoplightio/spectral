import { CustomDiagnosticSeverity, CUSTOM_SEVERITY_COLORS } from '@iso20022/custom-rulesets';
import { DiagnosticSeverity } from '@stoplight/types';

const SEVERITY_COLORS = {
  [DiagnosticSeverity.Error]: 'red',
  [DiagnosticSeverity.Warning]: 'yellow',
  [DiagnosticSeverity.Information]: 'blue',
  [DiagnosticSeverity.Hint]: 'white',
};

const EXTENDED_SEVERITY_COLORS = {
  ...SEVERITY_COLORS,
  ...CUSTOM_SEVERITY_COLORS,
};

export function getColorForSeverity(severity: DiagnosticSeverity | CustomDiagnosticSeverity): string {
  return EXTENDED_SEVERITY_COLORS[severity];
}

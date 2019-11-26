import { DiagnosticSeverity } from '@stoplight/types';

const SEVERITY_COLORS = {
  [DiagnosticSeverity.Error]: 'red',
  [DiagnosticSeverity.Warning]: 'yellow',
  [DiagnosticSeverity.Information]: 'blue',
  [DiagnosticSeverity.Hint]: 'white',
};

export function getColorForSeverity(severity: DiagnosticSeverity) {
  return SEVERITY_COLORS[severity];
}

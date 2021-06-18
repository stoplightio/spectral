import { DiagnosticSeverity } from '@stoplight/types';
import { HumanReadableDiagnosticSeverity } from '../types';

export const DEFAULT_SEVERITY_LEVEL = DiagnosticSeverity.Warning;

const SEVERITY_MAP: Record<HumanReadableDiagnosticSeverity, DiagnosticSeverity | -1> = {
  error: DiagnosticSeverity.Error,
  warn: DiagnosticSeverity.Warning,
  info: DiagnosticSeverity.Information,
  hint: DiagnosticSeverity.Hint,
  off: -1,
};

export function getDiagnosticSeverity(
  severity: DiagnosticSeverity | HumanReadableDiagnosticSeverity,
): DiagnosticSeverity | -1 {
  if (Number.isNaN(Number(severity))) {
    return SEVERITY_MAP[severity] as DiagnosticSeverity | -1;
  }

  return Number(severity);
}

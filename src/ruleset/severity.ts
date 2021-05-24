import { DiagnosticSeverity } from '@stoplight/types';
import { HumanReadableDiagnosticSeverity, SpectralDiagnosticSeverity } from '../types';

export const DEFAULT_SEVERITY_LEVEL = DiagnosticSeverity.Warning;

const SEVERITY_MAP: Record<HumanReadableDiagnosticSeverity, SpectralDiagnosticSeverity> = {
  error: DiagnosticSeverity.Error,
  warn: DiagnosticSeverity.Warning,
  info: DiagnosticSeverity.Information,
  hint: DiagnosticSeverity.Hint,
  off: -1,
};

export function getDiagnosticSeverity(
  severity: DiagnosticSeverity | HumanReadableDiagnosticSeverity,
): SpectralDiagnosticSeverity {
  if (Number.isNaN(Number(severity))) {
    return SEVERITY_MAP[severity] as SpectralDiagnosticSeverity;
  }

  return Number(severity);
}

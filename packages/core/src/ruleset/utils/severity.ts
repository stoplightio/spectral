import { CustomDiagnosticSeverity, CustomHumanReadableSeverity, CUSTOM_SEVERITY_MAP } from '@iso20022/custom-rulesets';
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

const EXTENDED_SEVERITY_MAP: Record<
  HumanReadableDiagnosticSeverity | CustomHumanReadableSeverity,
  DiagnosticSeverity | CustomDiagnosticSeverity | -1
> = {
  ...SEVERITY_MAP,
  ...CUSTOM_SEVERITY_MAP,
};

export function getDiagnosticSeverity(
  severity:
    | DiagnosticSeverity
    | CustomDiagnosticSeverity
    | HumanReadableDiagnosticSeverity
    | CustomHumanReadableSeverity,
): DiagnosticSeverity | CustomDiagnosticSeverity | -1 {
  if (Number.isNaN(Number(severity))) {
    return EXTENDED_SEVERITY_MAP[severity] as DiagnosticSeverity | CustomDiagnosticSeverity | -1;
  }

  return Number(severity);
}

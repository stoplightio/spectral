import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { HumanReadableDiagnosticSeverity, SpectralDiagnosticSeverity } from '../types';
import { FileRule, FileRuleCollection, FileRulesetSeverity } from '../types/ruleset';
import { isValidRule } from './validation';

export const DEFAULT_SEVERITY_LEVEL = DiagnosticSeverity.Warning;

export function getSeverityLevel(
  rules: FileRuleCollection,
  name: string,
  rule: FileRule | FileRulesetSeverity,
): SpectralDiagnosticSeverity {
  const existingRule = rules[name];

  if (!isValidRule(existingRule)) return -1;

  const existingSeverity =
    existingRule.severity !== undefined ? getDiagnosticSeverity(existingRule.severity) : DEFAULT_SEVERITY_LEVEL;

  if (rule === 'recommended') {
    return existingRule.recommended ? existingSeverity : -1;
  }

  if (rule === 'all') {
    return existingSeverity;
  }

  switch (typeof rule) {
    case 'number':
    case 'string':
      return getDiagnosticSeverity(rule);
    case 'boolean':
      return rule ? existingSeverity : -1;
    default:
      return -1;
  }
}

const SEVERITY_MAP: Dictionary<SpectralDiagnosticSeverity, HumanReadableDiagnosticSeverity> = {
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
    return SEVERITY_MAP[severity];
  }
  return Number(severity);
}

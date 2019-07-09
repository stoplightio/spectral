import { DiagnosticSeverity, Dictionary } from '@stoplight/types';
import { HumanReadableDiagnosticSeverity, SpectralDiagnosticSeverity } from '../types';
import { FileRule, FileRuleCollection, FileRulesetSeverity, FileRuleSeverity } from '../types/ruleset';
import { isValidRule } from './validation';

export const DEFAULT_SEVERITY_LEVEL = DiagnosticSeverity.Warning;

function getSeverityForRule(
  rule: FileRule | FileRuleSeverity,
  defaultSeverity: SpectralDiagnosticSeverity,
): DiagnosticSeverity {
  switch (typeof rule) {
    case 'number':
    case 'string':
      return getDiagnosticSeverity(rule);
    case 'boolean':
      return rule ? getDiagnosticSeverity(defaultSeverity) : -1;
    default:
      return defaultSeverity;
  }
}

export function getSeverityLevel(
  rules: FileRuleCollection,
  name: string,
  rule: FileRule | FileRulesetSeverity,
): SpectralDiagnosticSeverity {
  const existingRule = rules[name];

  // this is an edge case, please refer to related tests
  if (!isValidRule(existingRule)) {
    if (rule === 'off') return -1;

    if (rule === 'recommended' || rule === 'all') {
      if (existingRule === false || existingRule === -1 || existingRule === 'off') {
        return -1;
      }

      return getSeverityForRule(existingRule, DEFAULT_SEVERITY_LEVEL);
    }

    return getSeverityForRule(rule, DEFAULT_SEVERITY_LEVEL);
  }

  const existingSeverity =
    existingRule.severity !== undefined ? getDiagnosticSeverity(existingRule.severity) : DEFAULT_SEVERITY_LEVEL;

  if (rule === 'recommended') {
    return existingRule.recommended ? existingSeverity : -1;
  }

  if (rule === 'all') {
    return existingSeverity;
  }

  return getSeverityForRule(rule, existingSeverity);
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

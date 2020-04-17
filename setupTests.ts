import { DiagnosticSeverity } from '@stoplight/types';
import { getDiagnosticSeverity } from './src/rulesets/severity';
import { HumanReadableDiagnosticSeverity } from './src/types';
import { RulesetExceptionCollection } from './src/types/ruleset';

export const buildRulesetExceptionCollectionFrom = (
  loc: string,
  rules: string[] = ['a'],
): RulesetExceptionCollection => {
  const source = {};
  source[loc] = rules;
  return source;
};

export const normalizeSeverityFromJsonRuleset = (severity: string | number | undefined): DiagnosticSeverity => {
  if (severity === void 0) {
    return DiagnosticSeverity.Warning;
  }

  return getDiagnosticSeverity(severity as HumanReadableDiagnosticSeverity | DiagnosticSeverity);
};

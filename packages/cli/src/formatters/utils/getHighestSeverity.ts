import { CustomDiagnosticSeverity } from '@iso20022/custom-rulesets';
import { IRuleResult } from '@stoplight/spectral-core';
import { DiagnosticSeverity } from '@stoplight/types';

export const getHighestSeverity = (results: IRuleResult[]): DiagnosticSeverity | CustomDiagnosticSeverity =>
  results.length === 0 ? DiagnosticSeverity.Hint : Math.min(...results.map(({ severity }) => severity));

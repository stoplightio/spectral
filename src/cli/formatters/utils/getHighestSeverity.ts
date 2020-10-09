import { DiagnosticSeverity } from '@stoplight/types';
import { IRuleResult } from '../../../types';

export const getHighestSeverity = (results: IRuleResult[]): DiagnosticSeverity =>
  results.length === 0 ? DiagnosticSeverity.Hint : Math.min(...results.map(({ severity }) => severity));

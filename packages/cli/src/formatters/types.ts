import { IRuleResult } from '../../types';
import type { DiagnosticSeverity } from '@stoplight/types';

export type FormatterOptions = {
  failSeverity: DiagnosticSeverity;
};

export type Formatter = (results: IRuleResult[], options: FormatterOptions) => string;

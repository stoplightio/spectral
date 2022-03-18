import type { CustomDiagnosticSeverity } from '@iso20022/custom-rulesets';
import { ISpectralDiagnostic } from '@stoplight/spectral-core';
import type { DiagnosticSeverity } from '@stoplight/types';

export type FormatterOptions = {
  failSeverity: DiagnosticSeverity | CustomDiagnosticSeverity;
};

export type Formatter = (results: ISpectralDiagnostic[], options: FormatterOptions) => string;

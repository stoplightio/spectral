import { ISpectralDiagnostic } from '@stoplight/spectral-core';
import type { DiagnosticSeverity } from '@stoplight/types';

export type FormatterOptions = {
  failSeverity: DiagnosticSeverity;
};

export type Formatter = (results: ISpectralDiagnostic[], options: FormatterOptions) => string;

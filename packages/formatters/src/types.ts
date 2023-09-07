import { ISpectralDiagnostic, Ruleset } from '@stoplight/spectral-core';
import type { DiagnosticSeverity } from '@stoplight/types';

export type FormatterOptions = {
  failSeverity: DiagnosticSeverity;
};

export type Formatter = (results: ISpectralDiagnostic[], options: FormatterOptions, ruleset: Ruleset | null) => string;

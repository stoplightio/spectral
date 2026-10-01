import { ISpectralDiagnostic, Ruleset } from '@stoplight/spectral-core';
import type { DiagnosticSeverity } from '@stoplight/types';

export type HtmlFormatterOptions = {
  includeJsonPath: boolean;
};

export type FormatterOptions = {
  failSeverity: DiagnosticSeverity;
  htmlFormatterOptions?: HtmlFormatterOptions;
};

export type FormatterContext = {
  ruleset: Ruleset;
  spectralVersion: string;
};

export type Formatter = (results: ISpectralDiagnostic[], options: FormatterOptions, ctx?: FormatterContext) => string;

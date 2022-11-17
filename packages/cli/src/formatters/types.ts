import { ISpectralDiagnostic } from '@stoplight/spectral-core';
import type { HumanReadableDiagnosticSeverity } from '@stoplight/spectral-core';
import type { DiagnosticSeverity } from '@stoplight/types';

export type ScoringTable = {
  [key in HumanReadableDiagnosticSeverity]: ScoringSubtract[];
};
export interface ScoringSubtract {
  [key: number]: number;
}
export interface ScoringLevel {
  [key: string]: number;
}
export type ScoringConfig = {
  customScoring?: string;
  scoringSubtract: ScoringTable[];
  scoringLetter: ScoringLevel[];
  threshold: number;
  warningsSubtract: boolean;
  uniqueErrors: boolean;
};

export type FormatterOptions = {
  failSeverity: DiagnosticSeverity;
  scoringConfig?: ScoringConfig;
};

export type Formatter = (results: ISpectralDiagnostic[], options: FormatterOptions) => string;

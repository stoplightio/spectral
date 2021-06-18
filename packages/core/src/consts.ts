import { DiagnosticSeverity } from '@stoplight/types';
import { ParserOptions } from './ruleset';

export const SPECTRAL_PKG_VERSION = '';

export const DEFAULT_PARSER_OPTIONS = Object.freeze<Required<ParserOptions>>({
  incompatibleValues: DiagnosticSeverity.Error,
  duplicateKeys: DiagnosticSeverity.Error,
});

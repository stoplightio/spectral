import { DiagnosticSeverity } from '@stoplight/types';
import { HumanReadableDiagnosticSeverity, SpectralDiagnosticSeverity } from '../types';
import { FileRule, FileRuleCollection, FileRulesetSeverity } from '../types/ruleset';
export declare const DEFAULT_SEVERITY_LEVEL = DiagnosticSeverity.Warning;
export declare function getSeverityLevel(rules: FileRuleCollection, name: string, newRule: FileRule | FileRulesetSeverity): SpectralDiagnosticSeverity;
export declare function getDiagnosticSeverity(severity: DiagnosticSeverity | HumanReadableDiagnosticSeverity): SpectralDiagnosticSeverity;

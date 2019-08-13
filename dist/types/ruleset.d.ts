import { Dictionary } from '@stoplight/types';
import { DiagnosticSeverity } from '@stoplight/types';
import { HumanReadableDiagnosticSeverity, Rule } from './rule';
import { RuleCollection } from './spectral';
export declare type FileRuleSeverity = DiagnosticSeverity | HumanReadableDiagnosticSeverity | boolean;
export declare type FileRulesetSeverity = 'off' | 'recommended' | 'all';
export declare type FileRule = Rule | FileRuleSeverity | [FileRuleSeverity] | [FileRuleSeverity, object];
export declare type FileRuleCollection = Dictionary<FileRule, string>;
export interface IRuleset {
    rules: RuleCollection;
}
export interface IRulesetFile {
    extends?: Array<string | [string, FileRulesetSeverity]>;
    rules: FileRuleCollection;
}

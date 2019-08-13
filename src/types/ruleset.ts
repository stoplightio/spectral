import { Dictionary } from '@stoplight/types';
import { DiagnosticSeverity } from '@stoplight/types';
import { HumanReadableDiagnosticSeverity, Rule } from './rule';
import { RuleCollection } from './spectral';

export type FileRuleSeverity = DiagnosticSeverity | HumanReadableDiagnosticSeverity | boolean;
export type FileRulesetSeverity = 'off' | 'recommended' | 'all';

export type FileRule = Rule | FileRuleSeverity | [FileRuleSeverity] | [FileRuleSeverity, object];

export type FileRuleCollection = Dictionary<FileRule, string>;

export interface IRuleset {
  rules: RuleCollection;
}

export interface IRulesetFile {
  extends?: Array<string | [string, FileRulesetSeverity]>;
  formats?: string[];
  rules: FileRuleCollection;
}

export interface IRulesetFileMergingStrategy {
  severity?: FileRulesetSeverity;
}

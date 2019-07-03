import { Dictionary } from '@stoplight/types';
import { DiagnosticSeverity } from '@stoplight/types/dist';
import { HumanReadableDiagnosticSeverity, Rule } from './rule';

export type FileRuleSeverity = DiagnosticSeverity | HumanReadableDiagnosticSeverity | boolean;

export type FileRule = Rule | FileRuleSeverity | [FileRuleSeverity] | [FileRuleSeverity, object];

export type FileRuleCollection = Dictionary<FileRule, string>;

export interface IRuleset {
  rules: FileRuleCollection;
}

export interface IRulesetFile {
  extends?: string[];
  rules: FileRuleCollection;
}

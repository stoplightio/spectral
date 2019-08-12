import { Dictionary } from '@stoplight/types';
import { DiagnosticSeverity } from '@stoplight/types';
import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import { HumanReadableDiagnosticSeverity, Rule } from './rule';
import { FunctionsCollection, RuleCollection } from './spectral';

export type FileRuleSeverity = DiagnosticSeverity | HumanReadableDiagnosticSeverity | boolean;
export type FileRulesetSeverity = 'off' | 'recommended' | 'all';

export type FileRule = Rule | FileRuleSeverity | [FileRuleSeverity] | [FileRuleSeverity, object];

export type FileRuleCollection = Dictionary<FileRule, string>;

export interface IRuleset {
  rules: RuleCollection;
  functions: FunctionsCollection;
}

export interface IRulesetFile {
  extends?: Array<string | [string, FileRulesetSeverity]>;
  formats?: string[];
  rules: FileRuleCollection;
  functionsDir?: string;
  functions?: Array<string | [string, JSONSchema4 | JSONSchema6 | JSONSchema7]>;
}

export interface IRulesetFileMergingStrategy {
  severity?: FileRulesetSeverity;
}

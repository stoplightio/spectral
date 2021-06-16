import { Dictionary } from '@stoplight/types';
import { DiagnosticSeverity } from '@stoplight/types';
import { HumanReadableDiagnosticSeverity, IRule } from './rule';
import { RuleCollection } from './spectral';

export type FileRuleSeverity = DiagnosticSeverity | HumanReadableDiagnosticSeverity | boolean;
export type FileRulesetSeverity = 'off' | 'recommended' | 'all';

export type FileRule = IRule | FileRuleSeverity;

export type FileRuleCollection = Dictionary<FileRule, string>;

export interface IRulesetFunctionDefinition {
  code?: string;
  ref?: string;
  name: string;
  source: string | null;
}

export type RulesetFunctionCollection = Dictionary<IRulesetFunctionDefinition, string>;

export interface IParserOptions {
  duplicateKeys?: DiagnosticSeverity | HumanReadableDiagnosticSeverity;
  incompatibleValues?: DiagnosticSeverity | HumanReadableDiagnosticSeverity;
}

export interface IRuleset {
  rules: RuleCollection;
  functions: RulesetFunctionCollection;
  parserOptions?: IParserOptions;
}

export interface IRulesetFile {
  documentationUrl?: string;
  extends?: Array<string | [string, FileRulesetSeverity]>;
  formats?: string[];
  rules?: FileRuleCollection;
  functionsDir?: string;
  functions?: string[];
  parserOptions?: IParserOptions;
}

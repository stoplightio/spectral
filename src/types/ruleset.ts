import { Dictionary } from '@stoplight/types';
import { DiagnosticSeverity } from '@stoplight/types';
import { HumanReadableDiagnosticSeverity, Rule } from './rule';
import { JSONSchema, RuleCollection } from './spectral';

export type FileRuleSeverity = DiagnosticSeverity | HumanReadableDiagnosticSeverity | boolean;
export type FileRulesetSeverity = 'off' | 'recommended' | 'all';

export type FileRule = Rule | FileRuleSeverity | [FileRuleSeverity] | [FileRuleSeverity, object];

export type FileRuleCollection = Dictionary<FileRule, string>;

export interface IRulesetFunctionDefinition {
  code?: string;
  ref?: string;
  schema: JSONSchema | null;
  name: string;
}

export type RulesetFunctionCollection = Dictionary<IRulesetFunctionDefinition, string>;
export type RulesetExceptionCollection = Dictionary<string[], string>;

export interface IRuleset {
  rules: RuleCollection;
  functions: RulesetFunctionCollection;
  exceptions: RulesetExceptionCollection;
}

export interface IRulesetFile {
  extends?: Array<string | [string, FileRulesetSeverity]>;
  formats?: string[];
  rules?: FileRuleCollection;
  functionsDir?: string;
  functions?: Array<string | [string, JSONSchema]>;
  except?: RulesetExceptionCollection;
}

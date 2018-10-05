import { ErrorObject } from 'ajv';
import { AssertionError } from 'assert';

import { StyleRule } from './style';
import { ValidationRule } from './validation';
import { RuleType, RuleSeverity } from './rule';

export type TargetFormat = 'oas2' | 'oas3' | 'oas2|oas3' | '*';
export type Rule = ValidationRule | StyleRule;

export type RawResult = ErrorObject | AssertionError;
export type Path = (string | number)[];

export type IRuleFunction<I = Rule> = (object: any, r: I, ruleMeta: IRuleMetadata) => IRuleResult[];

export interface IRuleResult {
  type: RuleType;

  /**
   * The relevant path within the object being operated on
   */
  path: Path;

  /**
   * The rule emitting the result
   */
  name: string;

  /**
   * The rule summary for the rule generating the result
   */
  summary: string;

  /**
   * The rule emitting the result
   */
  severity: RuleSeverity;

  /**
   * Message describing the error
   */
  message: string;
}

export interface IRuleMetadata {
  path: Path;
  rule: Rule;
  name: string;
}

export interface IRuleConfig {
  rules: IRuleStore;
}

export interface IRuleStore {
  /**
   * index is a simplified regex of the format(s) the rules apply to (ie,
   * 'oas2', 'oas2|oas3', '*')
   */
  [index: string]: IRuleDeclaration;
}

export interface IRuleDeclaration {
  /**
   * Name of the rule with either a rule definition (when definining/overriding
   * rules) or boolean (when enabling/disabling a default rule)
   */
  [ruleName: string]: Rule | boolean;
}

export * from './style';
export * from './validation';
export * from './rule';

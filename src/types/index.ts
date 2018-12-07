import { ErrorObject } from 'ajv';
import { AssertionError } from 'assert';

// import { ValidationSeverity, RuleType } from './enums';
import { ObjPath } from '@stoplight/types/parsers';
import { Rule } from './rule';
import { IFunctionPaths } from './spectral';

export type TargetSpec = 'oas2' | 'oas3' | string;
export type RawResult = ErrorObject | AssertionError;
export type Path = Array<string | number>;

export interface IRuleOpts<I = Rule> {
  object: any;
  strObj?: string;
  resObj?: any;
  rule: I;
}

export type IRuleFunction<I = Rule> = (opts: IRuleOpts<I>, paths: IFunctionPaths) => IRuleResult[];

// export interface IRuleResult extends IValidationResult {
export interface IRuleResult {
  path: ObjPath;
  message: string;
  // type: RuleType;
}

export interface IRuleStore {
  /**
   * index is a simplified regex of the format(s) the rules apply to (ie,
   * 'oas2', 'oas3')
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

export * from './rule';
export * from './enums';

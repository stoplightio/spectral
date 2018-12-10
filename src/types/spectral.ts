import { Dictionary, ObjPath } from '@stoplight/types';

import { IFunction } from './function';
import { IRule, Rule } from './rule';

export type FunctionCollection = Dictionary<IFunction, string>;
export type RuleCollection = Dictionary<Rule, string>;
export type PartialRuleCollection = Dictionary<Partial<Rule>, string>;
export type RunRuleCollection = Dictionary<IRunRule, string>;

export interface IRunRule extends IRule {
  name: string;
}

/**
 * Name of the rule with a boolean value to enable or disable the rule.
 *
 * Will expand on this format later to allow for things like overriding rule options.
 */
export type RuleDeclarationCollection = Dictionary<boolean, string>;

export interface IRunOpts {
  /**
   * The fully-resolved version of the target object.
   *
   * Some functions require this in order to operate.
   */
  resolvedTarget?: object;
}

export interface IRunResult {
  results: IRuleResult[];
}

export interface IRuleResult {
  path: ObjPath;
  message: string;
}

export interface IGivenNode {
  path: ObjPath;
  value: any;
}

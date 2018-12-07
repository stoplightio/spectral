import { Dictionary, ObjPath } from '@stoplight/types';

import { IFunction } from './function';
import { IRule, Rule } from './rule';

export type FunctionCollection = Dictionary<IFunction, string>;
export type RuleCollection = Dictionary<Rule, string>;
export type RunRuleCollection = Dictionary<IRunRule, string>;

export interface IRunRule extends IRule {
  name: string;
}

/**
 * Name of the rule with either a rule definition (when definining/overriding
 * rules) or boolean (when enabling/disabling a default rule)
 */
export type RuleDeclaration = Dictionary<Partial<Rule> | boolean, string>;

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

import { Dictionary, IDiagnostic, IParserASTResult, IRange, JsonPath, Omit } from '@stoplight/types';
import { YAMLNode } from 'yaml-ast-parser';

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

export interface IConstructorOpts {
  resolver?: object;
}

export interface IRunOpts {
  /**
   * The resolved version of the target object (could vary depending on the
   * resolver used)
   *
   * Some functions require this in order to operate.
   */
  resolvedTarget?: object;

  parsed?: IParserASTResult<object, YAMLNode, number[]>;
}

export interface IRuleResult extends Omit<IDiagnostic, 'range'> {
  summary?: string;
  range?: IRange;
  path: JsonPath;
}

export interface IGivenNode {
  path: JsonPath;
  value: any;
}

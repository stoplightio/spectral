import { Dictionary, GetLocationForJsonPath, IDiagnostic, IParserResult, JsonPath } from '@stoplight/types';

import { Resolver } from '@stoplight/json-ref-resolver';
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
  resolver?: Resolver;
}

export interface IRunOpts {
  /**
   * The resolved version of the target object (could vary depending on the
   * resolver used)
   *
   * Some functions require this in order to operate.
   */
  resolvedTarget?: object;
}

export interface IRuleResult extends IDiagnostic {
  // @deprecated, use message instead
  summary?: string;
  path: JsonPath;
}

export interface IGivenNode {
  path: JsonPath;
  value: any;
}

export interface IParsedResult {
  parsed: IParserResult;
  getLocationForJsonPath: GetLocationForJsonPath<any, any>;
  source?: string;
}

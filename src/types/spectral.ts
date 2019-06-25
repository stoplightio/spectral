import { Dictionary, GetLocationForJsonPath, IDiagnostic, IParserResult, JsonPath } from '@stoplight/types';

import { SpectralResolver } from '../resolvers/resolver';
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
  resolver?: SpectralResolver;
}

export interface IRunOpts {
  resolve?: {
    documentUri?: string;
  };
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

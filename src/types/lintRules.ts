import { IRuleDefinitionBase } from './index';

export interface IRuleParam {
  properties: string | string[];
}

export interface IRuleStringParam extends IRuleParam {
  value: string;
}

export interface IRuleNumberParam {
  value: number;
  property?: string;
}

export interface IAlphaRuleParam extends IRuleParam {
  // if sorting objects, use key for comparison
  keyedBy?: string;
}

export interface IRulePatternParam {
  // object key to apply rule to
  property: string;

  // value to use for rule
  value: string;

  // value to omit from regex matching
  omit?: string;

  // value to split the property on prior to performing regex matching
  split?: string;
}

export interface ITruthyRule extends IRuleDefinitionBase {
  type: 'truthy';

  // key(s) of object that should evaluate as 'truthy' (considered true in a
  // boolean context)
  truthy: string | string[];

  properties?: number;
}

export interface IOrRule extends IRuleDefinitionBase {
  type: 'or';

  // test to verify if any of the provided keys are present in object
  or: string[];
}

export interface IXorRule extends IRuleDefinitionBase {
  type: 'xor';

  // test to verify if one (but not all) of the provided keys are present in
  // object
  xor: string[];
}

export interface IMaxLengthRule extends IRuleDefinitionBase {
  type: 'maxLength';

  // verify property is under a specified number of characters
  maxLength: IRuleNumberParam;
}

export interface IAlphaRule extends IRuleDefinitionBase {
  type: 'alphabetical';

  // verify property is within alphabetical order
  alphabetical: IAlphaRuleParam;
}

export interface INotEndWithRule extends IRuleDefinitionBase {
  type: 'notEndWith';

  // verify property does not end with string
  notEndWith: IRulePatternParam;
}

export interface INotContainRule extends IRuleDefinitionBase {
  type: 'notContain';

  // verify property does not contain value
  notContain: IRuleStringParam;
}

export interface IPatternRule extends IRuleDefinitionBase {
  type: 'pattern';

  // run regex match
  pattern: IRulePatternParam;
}

export interface IFunctionRule extends IRuleDefinitionBase {
  type: 'function';
  function: string; // eventually allow js functions here? or references to one
  args?: any; //need to think about this a little
}

export type LintRule =
  | ITruthyRule
  | IOrRule
  | IXorRule
  | IMaxLengthRule
  | IAlphaRule
  | INotEndWithRule
  | INotContainRule
  | IPatternRule
  | IFunctionRule;

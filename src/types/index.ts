import { AssertionError } from 'assert';

export interface IOptions {
  skip?: string[];
}

export interface IRuleBase {
  // name of the rule
  name: string;

  // description of the rule's purpose
  description: string;

  // whether the rule is enabled or not
  enabled: boolean;

  // JSON path (or paths) within the object with which this rule applies
  path: string;
}

export interface IRuleResult {
  // the path within the object being operated on
  pointer: string | null;

  // the rule triggering the result
  rule: Rule;

  // the specific error triggering the result
  error: AssertionError;
}

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
  // object key to match on
  property: string;

  // regex to perform comparison on
  value: string;

  // value to omit from regex matching
  omit?: string;

  // value to split the property on prior to performing regex matching
  split?: string;
}

export interface ITruthyRule extends IRuleBase {
  type: 'truthy';

  // key(s) of object that should evaluate as 'truthy' (considered true in a
  // boolean context)
  truthy: string | string[];

  // ???? - doesn't seem to be in use
  skip?: string;

  properties?: number;
}

export interface IOrRule extends IRuleBase {
  type: 'or';

  // test to verify if any of the provided keys are present in object
  or: string[];
}

export interface IXorRule extends IRuleBase {
  type: 'xor';

  // test to verify if one (but not all) of the provided keys are present in
  // object
  xor: string[];
}

export interface IMaxLengthRule extends IRuleBase {
  type: 'maxLength';

  // verify property is under a specified number of characters
  maxLength: IRuleNumberParam;
}

export interface IAlphaRule extends IRuleBase {
  type: 'alphabetical';

  // verify property is within alphabetical order
  alphabetical: IAlphaRuleParam;
}

export interface INotEndWithRule extends IRuleBase {
  type: 'notEndWith';

  // verify property does not end with string
  notEndWith: IRulePatternParam;
}

export interface INotContainRule extends IRuleBase {
  type: 'notContain';

  // verify property does not contain value
  notContain: IRuleStringParam;
}

export interface IPatternRule extends IRuleBase {
  type: 'pattern';

  // run regex match
  pattern: IRulePatternParam;
}

export type Rule =
  | ITruthyRule
  | IOrRule
  | IXorRule
  | IMaxLengthRule
  | IAlphaRule
  | INotEndWithRule
  | INotContainRule
  | IPatternRule;

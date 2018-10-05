import { IRuleDefinitionBase } from './rule';

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
  function: 'truthy';

  input: {
    // key(s) of object that should evaluate as 'truthy' (considered true in a
    // boolean context)
    properties: string | string[];

    max?: number;
  };
}

export interface IOrRule extends IRuleDefinitionBase {
  function: 'or';

  input: {
    // test to verify if any of the provided keys are present in object
    properties: string[];
  };
}

export interface IXorRule extends IRuleDefinitionBase {
  function: 'xor';

  input: {
    // test to verify if one (but not all) of the provided keys are present in
    // object
    properties: string[];
  };
}

export interface IMaxLengthRule extends IRuleDefinitionBase {
  function: 'maxLength';

  // verify property is under a specified number of characters
  input: IRuleNumberParam;
}

export interface IAlphaRule extends IRuleDefinitionBase {
  function: 'alphabetical';

  // verify property is within alphabetical order
  input: IAlphaRuleParam;
}

export interface INotEndWithRule extends IRuleDefinitionBase {
  function: 'notEndWith';

  // verify property does not end with string
  input: IRulePatternParam;
}

export interface INotContainRule extends IRuleDefinitionBase {
  function: 'notContain';

  // verify property does not contain value
  input: IRuleStringParam;
}

export interface IPatternRule extends IRuleDefinitionBase {
  function: 'pattern';

  // run regex match
  input: IRulePatternParam;
}

export type StyleRule =
  | ITruthyRule
  | IOrRule
  | IXorRule
  | IMaxLengthRule
  | IAlphaRule
  | INotEndWithRule
  | INotContainRule
  | IPatternRule;

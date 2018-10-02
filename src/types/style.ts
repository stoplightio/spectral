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
  function: 'truthy';

  input: {
    // key(s) of object that should evaluate as 'truthy' (considered true in a
    // boolean context)
    truthy: string | string[];

    properties?: number;
  };
}

export interface IOrRule extends IRuleDefinitionBase {
  function: 'or';

  input: {
    // test to verify if any of the provided keys are present in object
    or: string[];
  };
}

export interface IXorRule extends IRuleDefinitionBase {
  function: 'xor';

  input: {
    // test to verify if one (but not all) of the provided keys are present in
    // object
    xor: string[];
  };
}

export interface IMaxLengthRule extends IRuleDefinitionBase {
  function: 'maxLength';

  input: {
    // verify property is under a specified number of characters
    maxLength: IRuleNumberParam;
  };
}

export interface IAlphaRule extends IRuleDefinitionBase {
  function: 'alphabetical';

  input: {
    // verify property is within alphabetical order
    alphabetical: IAlphaRuleParam;
  };
}

export interface INotEndWithRule extends IRuleDefinitionBase {
  function: 'notEndWith';

  input: {
    // verify property does not end with string
    notEndWith: IRulePatternParam;
  };
}

export interface INotContainRule extends IRuleDefinitionBase {
  function: 'notContain';

  input: {
    // verify property does not contain value
    notContain: IRuleStringParam;
  };
}

export interface IPatternRule extends IRuleDefinitionBase {
  function: 'pattern';

  input: {
    // run regex match
    pattern: IRulePatternParam;
  };
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

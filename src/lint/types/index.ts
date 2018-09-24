export interface IOptions {
  skip?: string[];
}

// JSON value
export interface IRuleJSON {
  // name of the rule
  name: string;

  // description of the rule's purpose
  description: string;

  // whether the rule is enabled or not
  enabled: boolean;

  // JSON path (or paths) within the object with which this rule applies
  path: string;

  // The severity of rule failure (warn or error)
  severity?: string;
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
  // object key to apply rule to
  property: string;

  // value to use for rule
  value: string;

  // value to omit from regex matching
  omit?: string;

  // value to split the property on prior to performing regex matching
  split?: string;
}

export interface ITruthyRule extends IRuleJSON {
  type: 'truthy';

  // key(s) of object that should evaluate as 'truthy' (considered true in a
  // boolean context)
  truthy: string | string[];

  // ???? - doesn't seem to be in use
  skip?: string;

  properties?: number;
}

export interface IOrRule extends IRuleJSON {
  type: 'or';

  // test to verify if any of the provided keys are present in object
  or: string[];
}

export interface IXorRule extends IRuleJSON {
  type: 'xor';

  // test to verify if one (but not all) of the provided keys are present in
  // object
  xor: string[];
}

export interface IMaxLengthRule extends IRuleJSON {
  type: 'maxLength';

  // verify property is under a specified number of characters
  maxLength: IRuleNumberParam;
}

export interface IAlphaRule extends IRuleJSON {
  type: 'alphabetical';

  // verify property is within alphabetical order
  alphabetical: IAlphaRuleParam;
}

export interface INotEndWithRule extends IRuleJSON {
  type: 'notEndWith';

  // verify property does not end with string
  notEndWith: IRulePatternParam;
}

export interface INotContainRule extends IRuleJSON {
  type: 'notContain';

  // verify property does not contain value
  notContain: IRuleStringParam;
}

export interface IPatternRule extends IRuleJSON {
  type: 'pattern';

  // run regex match
  pattern: IRulePatternParam;
}

export type LintRule =
  | ITruthyRule
  | IOrRule
  | IXorRule
  | IMaxLengthRule
  | IAlphaRule
  | INotEndWithRule
  | INotContainRule
  | IPatternRule;

import { ValidationSeverity, ValidationSeverityLabel } from '@stoplight/types/validations';
import { RuleFunction, RuleType } from './enums';

export type Rule =
  | IRule
  | ITruthyRule
  | IOrRule
  | IXorRule
  | IMaxLengthRule
  | IAlphaRule
  | INotEndWithRule
  | INotContainRule
  | IPatternRule
  | ISchemaRule
  | IParamCheckRule;

export interface IRule {
  type: RuleType;

  // The JSON path within the object this rule applies to
  path: string;

  // name of the function to run
  function: string;

  // Input to the function
  input?: any;

  // A short summary of the rule and its intended purpose
  summary: string;

  // A long-form description of the rule formatted in markdown
  description?: string;

  // should the rule be enabled by default?
  enabled?: boolean;

  // The severity of results this rule generates
  severity?: ValidationSeverity;
  severityLabel?: ValidationSeverityLabel;

  // Tags attached to the rule, which can be used for organizational purposes
  tags?: string[];
}

export interface IRuleParam {
  properties: string | string[] | string[][];
}

export interface IRuleStringParam extends IRuleParam {
  value: string;
}

export interface IRuleNumberParam {
  value: number;
  property?: string | string[];
}

export interface IAlphaRuleParam extends IRuleParam {
  // if sorting objects, use key for comparison
  keyedBy?: string;
}

export interface IRulePatternParam {
  // value to use for rule
  value: string;

  // object key to apply rule to
  property?: string | string[];

  // value to omit from regex matching
  omit?: string;

  // value to split the property on prior to performing regex matching
  split?: string;
}

export interface ITruthyRule extends IRule {
  function: RuleFunction.TRUTHY;

  input: {
    // key(s) of object that should evaluate as 'truthy' (considered true in a
    // boolean context)
    // note: string[][] represents a list of object "paths"
    properties: string | string[] | string[][];

    max?: number;
  };
}

export interface IOrRule extends IRule {
  function: RuleFunction.OR;

  input: {
    // test to verify if any of the provided keys are present in object
    properties: string[] | string[][];
  };
}

export interface IXorRule extends IRule {
  function: RuleFunction.XOR;

  input: {
    // test to verify if one (but not all) of the provided keys are present in
    // object
    properties: string[] | string[][];
  };
}

export interface IMaxLengthRule extends IRule {
  function: RuleFunction.MAX_LENGTH;

  // verify property is under a specified number of characters
  input: IRuleNumberParam;
}

export interface IAlphaRule extends IRule {
  function: RuleFunction.ALPHABETICAL;

  // verify property is within alphabetical order
  input: IAlphaRuleParam;
}

export interface INotEndWithRule extends IRule {
  function: RuleFunction.NOT_END_WITH;

  // verify property does not end with string
  input: IRulePatternParam;
}

export interface INotContainRule extends IRule {
  function: RuleFunction.NOT_CONTAIN;

  // verify property does not contain value
  input: IRuleStringParam;
}

export interface IPatternRule extends IRule {
  function: RuleFunction.PATTERN;

  // run regex match
  input: IRulePatternParam;
}

export interface ISchemaRule extends IRule {
  function: RuleFunction.SCHEMA;
  input: {
    schema: object;
  };
}

export interface IParamCheckRule extends IRule {
  function: RuleFunction.SCHEMA;
  input: {
    schema: object;
  };
}

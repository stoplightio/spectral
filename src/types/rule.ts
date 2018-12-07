import { ValidationSeverity, ValidationSeverityLabel } from '@stoplight/types/validations';
import { RuleFunction, RuleType } from './enums';

export type Rule =
  | IRule
  | TruthyRule
  | IOrRule
  | IXorRule
  | IMaxLengthRule
  | AlphaRule
  | INotEndWithRule
  | INotContainRule
  | IPatternRule
  | ISchemaRule
  | IParamCheckRule;

export interface IRule<T = string, O = any> {
  // A short summary of the rule and its intended purpose
  summary: string;

  type?: RuleType;

  // The severity of results this rule generates
  severity?: ValidationSeverity;
  severityLabel?: ValidationSeverityLabel;

  // A long-form description of the rule formatted in markdown
  description?: string;

  // Tags attached to the rule, which can be used for organizational purposes
  tags?: string[];

  // should the rule be enabled by default?
  enabled?: boolean;

  // Filter the target down to a subset[] with a JSON path
  given: string;

  when?: {
    // the `path.to.prop` to field, or special `@key` value to target keys for matched `given` object
    // EXAMPLE: if the target object is an oas object and given = `$..responses[*]`, then `@key` would be the response code (200, 400, etc)
    field: string;

    // a regex pattern
    pattern?: string;
  };

  then: IThen<T, O> | Array<IThen<T, O>>;
}

export interface IThen<T, O> {
  // the `path.to.prop` to field, or special `@key` value to target keys for matched `given` object
  // EXAMPLE: if the target object is an oas object and given = `$..responses[*]`, then `@key` would be the response code (200, 400, etc)
  field?: string;

  // name of the function to run
  function: T;

  // Options passed to the function
  functionOptions?: O;
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

export interface IRulePatternParam {
  // value to use for rule
  value: string;

  // object key to apply rule to
  property?: string;

  // value to omit from regex matching
  omit?: string;

  // value to split the property on prior to performing regex matching
  split?: string;
}

export interface ITruthRuleOptions {
  /** key(s) of object that should evaluate as 'truthy' (considered true in a boolean context) */
  properties: string | string[];
}
export type TruthyRule = IRule<RuleFunction.TRUTHY, ITruthRuleOptions>;

export interface IOrRule extends IRule {
  then: {
    function: RuleFunction.OR;

    functionOptions: {
      // test to verify if any of the provided keys are present in object
      properties: string[];
    };
  };
}

export interface IXorRule extends IRule {
  then: {
    function: RuleFunction.XOR;

    functionOptions: {
      // test to verify if one (but not all) of the provided keys are present in
      // object
      properties: string[];
    };
  };
}

export interface IMaxLengthRule extends IRule {
  then: {
    function: RuleFunction.MAX_LENGTH;

    // verify property is under a specified number of characters
    functionOptions: IRuleNumberParam;
  };
}

export interface IAlphaRuleOptions {
  /** if sorting objects, use key for comparison */
  keyedBy?: string;
}
export type AlphaRule = IRule<RuleFunction.ALPHABETICAL, IAlphaRuleOptions>;

export interface INotEndWithRule extends IRule {
  then: {
    function: RuleFunction.NOT_END_WITH;

    // verify property does not end with string
    functionOptions: IRulePatternParam;
  };
}

export interface INotContainRule extends IRule {
  then: {
    function: RuleFunction.NOT_CONTAIN;

    // verify property does not contain value
    functionOptions: IRuleStringParam;
  };
}

export interface IPatternRule extends IRule {
  then: {
    function: RuleFunction.PATTERN;

    // run regex match
    functionOptions: IRulePatternParam;
  };
}

export interface ISchemaRule extends IRule {
  then: {
    function: RuleFunction.SCHEMA;
    functionOptions: {
      schema: object;
    };
  };
}

export interface IParamCheckRule extends IRule {
  then: {
    function: RuleFunction.SCHEMA;
    functionOptions: {
      schema: object;
    };
  };
}

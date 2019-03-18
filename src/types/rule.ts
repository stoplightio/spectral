import { DiagnosticSeverity } from '@stoplight/types';
import { RuleFunction, RuleType } from './enums';

export type Rule = IRule | TruthyRule | XorRule | LengthRule | AlphaRule | PatternRule | SchemaRule;

export interface IRule<T = string, O = any> {
  type?: RuleType;

  // A short summary of the rule and its intended purpose
  summary?: string;

  // A long-form description of the rule formatted in markdown
  description?: string;

  // The severity of results this rule generates
  severity?: DiagnosticSeverity;

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

export type TruthyRule = IRule<RuleFunction.TRUTHY>;

export interface IXorRuleOptions {
  /** test to verify if one (but not all) of the provided keys are present in object */
  properties: string[];
}
export type XorRule = IRule<RuleFunction.XOR, IXorRuleOptions>;

export interface ILengthRuleOptions {
  min?: number;
  max?: number;
}
export type LengthRule = IRule<RuleFunction.LENGTH, ILengthRuleOptions>;

export interface IAlphaRuleOptions {
  /** if sorting array of objects, which key to use for comparison */
  keyedBy?: string;
}
export type AlphaRule = IRule<RuleFunction.ALPHABETICAL, IAlphaRuleOptions>;

export interface IRulePatternOptions {
  /** regex that target must match */
  match?: string;

  /** regex that target must not match */
  notMatch?: string;
}
export type PatternRule = IRule<RuleFunction.PATTERN, IRulePatternOptions>;

export interface ISchemaOptions {
  schema: object;
}
export type SchemaRule = IRule<RuleFunction.SCHEMA, ISchemaOptions>;

export interface ISchemaPathOptions {
  schemaPath: string;
  // the `path.to.prop` to field, or special `@key` value to target keys for matched `given` object
  field?: string;
}
export type SchemaPathRule = IRule<RuleFunction.SCHEMAPATH, ISchemaPathOptions>;

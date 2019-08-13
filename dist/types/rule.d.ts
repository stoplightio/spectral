import { DiagnosticSeverity } from '@stoplight/types';
import { RuleFunction, RuleType } from './enums';
export declare type Rule = IRule | TruthyRule | XorRule | LengthRule | AlphaRule | PatternRule | SchemaRule;
export interface IRule<T = string, O = any> {
    type?: RuleType;
    message?: string;
    description?: string;
    severity?: DiagnosticSeverity | HumanReadableDiagnosticSeverity;
    tags?: string[];
    recommended?: boolean;
    given: string;
    when?: {
        field: string;
        pattern?: string;
    };
    then: IThen<T, O> | Array<IThen<T, O>>;
}
export interface IThen<T = string, O = any> {
    field?: string;
    function: T;
    functionOptions?: O;
}
export declare type TruthyRule = IRule<RuleFunction.TRUTHY>;
export interface IXorRuleOptions {
    properties: string[];
}
export declare type XorRule = IRule<RuleFunction.XOR, IXorRuleOptions>;
export interface ILengthRuleOptions {
    min?: number;
    max?: number;
}
export declare type LengthRule = IRule<RuleFunction.LENGTH, ILengthRuleOptions>;
export interface IEnumRuleOptions {
    values: Array<string | number>;
}
export declare type EnumRule = IRule<RuleFunction.ENUM, IEnumRuleOptions>;
export interface IAlphaRuleOptions {
    keyedBy?: string;
}
export declare type AlphaRule = IRule<RuleFunction.ALPHABETICAL, IAlphaRuleOptions>;
export interface IRulePatternOptions {
    match?: string;
    notMatch?: string;
}
export declare type PatternRule = IRule<RuleFunction.PATTERN, IRulePatternOptions>;
export interface ISchemaOptions {
    schema: object;
}
export declare type SchemaRule = IRule<RuleFunction.SCHEMA, ISchemaOptions>;
export interface ISchemaPathOptions {
    schemaPath: string;
    field?: string;
}
export declare type SchemaPathRule = IRule<RuleFunction.SCHEMAPATH, ISchemaPathOptions>;
export declare type HumanReadableDiagnosticSeverity = 'error' | 'warn' | 'info' | 'hint' | 'off';

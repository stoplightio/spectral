import { Resolver } from '@stoplight/json-ref-resolver/dist';
import { DiagnosticSeverity, Dictionary, GetLocationForJsonPath, IDiagnostic, IParserResult, JsonPath } from '@stoplight/types';
import { IFunction, IRule, Rule } from '.';
export declare type FunctionCollection = Dictionary<IFunction, string>;
export declare type RuleCollection = Dictionary<Rule, string>;
export declare type PartialRuleCollection = Dictionary<Partial<Rule>, string>;
export declare type RunRuleCollection = Dictionary<IRunRule, string>;
export interface IRunRule extends IRule {
    name: string;
    severity: SpectralDiagnosticSeverity;
}
export declare type SpectralDiagnosticSeverity = DiagnosticSeverity | -1;
export declare type RuleDeclarationCollection = Dictionary<boolean, string>;
export interface IConstructorOpts {
    resolver?: Resolver;
}
export interface IRunOpts {
    resolve?: {
        documentUri?: string;
    };
}
export interface IRuleResult extends IDiagnostic {
    path: JsonPath;
}
export interface IGivenNode {
    path: JsonPath;
    value: any;
}
export interface IParsedResult<R extends IParserResult = IParserResult<unknown, any, any, any>> {
    parsed: IParserResult;
    getLocationForJsonPath: GetLocationForJsonPath<R>;
    source?: string;
}

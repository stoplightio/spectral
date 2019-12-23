import { IResolveOpts, IResolveResult } from '@stoplight/json-ref-resolver/types';
import {
  DiagnosticSeverity,
  Dictionary,
  GetLocationForJsonPath,
  IDiagnostic,
  IParserResult,
  JsonPath,
} from '@stoplight/types';
import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import { IFunction, IRule, Rule } from '.';
import { ComputeFingerprintFunc } from '../utils';

export type FunctionCollection = Dictionary<IFunction, string>;
export type RuleCollection = Dictionary<Rule, string>;
export type PartialRuleCollection = Dictionary<Partial<Rule>, string>;
export type RunRuleCollection = Dictionary<IRunRule, string>;

export interface IRunRule extends IRule {
  name: string;
  severity: SpectralDiagnosticSeverity;
}

export type SpectralDiagnosticSeverity = DiagnosticSeverity | -1;

/**
 * Name of the rule with a boolean value to enable or disable the rule.
 *
 * Will expand on this format later to allow for things like overriding rule options.
 */
export type RuleDeclarationCollection = Dictionary<boolean, string>;

export interface IConstructorOpts {
  resolver?: IResolver;
  computeFingerprint?: ComputeFingerprintFunc;
}

export interface IRunOpts {
  ignoreUnknownFormat?: boolean;
  resolve?: {
    documentUri?: string;
  };
}

export interface IRuleResult extends IDiagnostic {
  path: JsonPath;
}

export interface ISpectralFullResult {
  resolved: unknown;
  results: IRuleResult[];
}

export interface IGivenNode {
  path: JsonPath;
  value: any;
}

export interface IParsedResult<R extends IParserResult = IParserResult<unknown, any, any, any>> {
  parsed: IParserResult;
  getLocationForJsonPath: GetLocationForJsonPath<R>;
  source?: string;
  formats?: string[];
}

export type ResolveResult = Omit<IResolveResult, 'runner'>;

export interface IResolver {
  resolve(source: unknown, opts?: IResolveOpts): Promise<ResolveResult>;
}

export type FormatLookup = (document: unknown) => boolean;
export type RegisteredFormats = Dictionary<FormatLookup, string>;

export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;

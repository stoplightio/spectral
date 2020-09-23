import { IResolveOpts, IResolveResult } from '@stoplight/json-ref-resolver/types';
import { DiagnosticSeverity, Dictionary, IDiagnostic, JsonPath } from '@stoplight/types';
import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import { IFunction, IRule } from '.';
import { Rule } from '../rule';
import { ComputeFingerprintFunc } from '../utils';

export type FunctionCollection = Dictionary<IFunction<any>, string>;
export type RuleCollection = Dictionary<IRule, string>;
export type PartialRuleCollection = Dictionary<Partial<IRule>, string>;
export type RunRuleCollection = Dictionary<Rule, string>;

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
  useNimma?: boolean;
  proxyUri?: string;
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

export type ResolveResult = Omit<IResolveResult, 'runner'>;

export interface IResolver {
  resolve(source: unknown, opts?: IResolveOpts): Promise<ResolveResult>;
}

// todo(@p0lip): make it string | null when working on 6.0
export type FormatLookup = (document: unknown, source?: string) => boolean;
export type RegisteredFormats = Dictionary<FormatLookup, string>;

export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;

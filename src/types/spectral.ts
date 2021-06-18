import { IResolveOpts, IResolveResult } from '@stoplight/json-ref-resolver/types';
import { IDiagnostic, JsonPath } from '@stoplight/types';
import { JSONSchema7 } from 'json-schema';
import { ComputeFingerprintFunc } from '../utils';

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

export interface ISpectralDiagnostic extends IDiagnostic {
  path: JsonPath;
  code: string | number;
}

export type IRuleResult = ISpectralDiagnostic;

export interface ISpectralFullResult {
  resolved: unknown;
  results: IRuleResult[];
}

export interface IGivenNode {
  path: JsonPath;
  value: unknown;
}

export type ResolveResult = Omit<IResolveResult, 'runner'>;

export interface IResolver {
  resolve(source: unknown, opts?: IResolveOpts): Promise<ResolveResult>;
}

export type JSONSchema = JSONSchema7;

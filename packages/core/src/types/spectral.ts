import { IDiagnostic, JsonPath } from '@stoplight/types';
import { JSONSchema7 } from 'json-schema';
import type { Resolver } from '@stoplight/spectral-ref-resolver';

export interface IConstructorOpts {
  resolver?: Resolver;
}

export interface IRunOpts {
  ignoreUnknownFormat?: boolean;
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

export type JSONSchema = JSONSchema7;

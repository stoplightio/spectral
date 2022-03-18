import { CustomDiagnosticSeverity } from '@iso20022/custom-rulesets';
import type { Resolver } from '@stoplight/spectral-ref-resolver';
import { DiagnosticSeverity, IDiagnostic, JsonPath } from '@stoplight/types';
import type { JSONSchema7 } from 'json-schema';

export interface IConstructorOpts {
  resolver?: Resolver;
}

export interface IRunOpts {
  ignoreUnknownFormat?: boolean;
}

export interface ISpectralDiagnostic extends Omit<IDiagnostic, 'severity'> {
  path: JsonPath;
  code: string | number;
  reference: string | null;
  severity: DiagnosticSeverity | CustomDiagnosticSeverity;
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

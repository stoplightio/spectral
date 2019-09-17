import { HumanReadableDiagnosticSeverity } from './rule';

export type FailSeverity = HumanReadableDiagnosticSeverity;

export enum OutputFormat {
  JSON = 'json',
  STYLISH = 'stylish',
  JUNIT = 'junit',
}

export interface ILintConfig {
  encoding: string;
  format: OutputFormat;
  output?: string;
  ruleset?: string[];
  skipRule?: string[];
  verbose?: boolean;
  quiet?: boolean;
}

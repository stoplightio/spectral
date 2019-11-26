import { HumanReadableDiagnosticSeverity } from './rule';

export type FailSeverity = HumanReadableDiagnosticSeverity;

export enum OutputFormat {
  JSON = 'json',
  STYLISH = 'stylish',
  JUNIT = 'junit',
  HTML = 'html',
}

export interface ILintConfig {
  encoding: string;
  format: OutputFormat;
  output?: string;
  resolver?: string;
  ruleset?: string[];
  skipRule?: string[];
  verbose?: boolean;
  quiet?: boolean;
}

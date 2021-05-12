import { HumanReadableDiagnosticSeverity } from './rule';

export type FailSeverity = HumanReadableDiagnosticSeverity;

export enum OutputFormat {
  JSON = 'json',
  STYLISH = 'stylish',
  JUNIT = 'junit',
  HTML = 'html',
  TEXT = 'text',
  TEAMCITY = 'teamcity',
  PRETTY = 'pretty',
}

export interface ILintConfig {
  encoding: string;
  format: OutputFormat;
  output?: string;
  resolver?: string;
  ruleset?: string[];
  paths?: string[];
  ignoreUnknownFormat: boolean;
  failOnUnmatchedGlobs: boolean;
  verbose?: boolean;
  quiet?: boolean;
}

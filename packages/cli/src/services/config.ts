import { HumanReadableDiagnosticSeverity } from '@stoplight/spectral-core';

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
  encoding: 'utf8' | 'ascii' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'latin1' | 'binary' | 'hex';
  format: OutputFormat;
  output?: string;
  resolver?: string;
  ruleset?: string;
  stdinFilepath?: string;
  ignoreUnknownFormat: boolean;
  failOnUnmatchedGlobs: boolean;
  verbose?: boolean;
  quiet?: boolean;
}

import { Dictionary } from '@stoplight/types';
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
  GITHUB_ACTIONS = 'github-actions',
  SARIF = 'sarif',
  CODE_CLIMATE = 'code-climate',
  GITLAB = 'gitlab',
  MARKDOWN = 'markdown',
}

export interface ILintConfig {
  encoding: 'utf8' | 'ascii' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'latin1' | 'binary' | 'hex';
  format: OutputFormat[];
  output?: Dictionary<string>;
  resolver?: string;
  ruleset?: string;
  stdinFilepath?: string;
  ignoreUnknownFormat: boolean;
  failOnUnmatchedGlobs: boolean;
  showDocumentationUrl: boolean;
  verbose?: boolean;
  quiet?: boolean;
}

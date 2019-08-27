export enum OutputFormat {
  JSON = 'json',
  STYLISH = 'stylish',
}

export interface ILintConfig {
  encoding: string;
  format: OutputFormat;
  output?: string;
  ruleset?: string | string[];
  skipRule?: string | string[];
  verbose: boolean;
  quiet?: boolean;
}

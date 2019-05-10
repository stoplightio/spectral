export enum ConfigFormat {
  JSON = 'json',
  STYLISH = 'stylish',
}

export enum ConfigCommand {
  LINT = 'lint',
}

export interface ILintConfig {
  encoding: string;
  format: ConfigFormat;
  maxResults?: number;
  output?: string;
  ruleset?: string[];
  skipRule?: string[];
  verbose: boolean;
}

export interface IConfig {
  extends?: string;
  lint: ILintConfig;
}

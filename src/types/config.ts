export enum ConfigFormat {
  JSON = 'json',
  STYLISH = 'stylish',
}

export interface ILintConfig {
  encoding: string;
  format: ConfigFormat;
  maxResults?: number;
  output?: string;
  verbose: boolean;
  ruleset?: string[];
}

export interface IConfig {
  extends?: string;
  lint: ILintConfig;
}

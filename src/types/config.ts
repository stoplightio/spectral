export enum ConfigFormat {
  JSON = 'json',
  STYLISH = 'stylish',
}

export interface IConfig {
  extends?: string;
  encoding: string;
  format: ConfigFormat;
  maxResults?: number;
  output?: string;
  verbose: boolean;
  ruleset?: string;
  config?: string;
}

/*eslint-disable*/

export interface Ruleset {
  aliases?: {
    [k: string]: unknown;
  };
  except?: {
    [k: string]: string[];
  };
  extends?: string | (string | [string, 'all' | 'recommended' | 'off'])[];
  formats?: string[];
  functions?: string[];
  functionsDir?: string;
  rules?: {
    formats?: string[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

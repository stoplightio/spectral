/*eslint-disable*/

export interface Ruleset {
  except?: {
    [k: string]: string[];
  };
  extends?: string | (string | [string, 'all' | 'recommended' | 'off'])[];
  formats?: (
    | 'oas2'
    | 'oas3'
    | 'oas3.0'
    | 'oas3.1'
    | 'asyncapi2'
    | 'json-schema'
    | 'json-schema-loose'
    | 'json-schema-draft4'
    | 'json-schema-draft6'
    | 'json-schema-draft7'
    | 'json-schema-2019-09'
    | 'json-schema-2020-12'
  )[];
  functions?: string[];
  functionsDir?: string;
  rules?: {
    formats?: (
      | 'oas2'
      | 'oas3'
      | 'oas3.0'
      | 'oas3.1'
      | 'asyncapi2'
      | 'json-schema'
      | 'json-schema-loose'
      | 'json-schema-draft4'
      | 'json-schema-draft6'
      | 'json-schema-draft7'
      | 'json-schema-2019-09'
      | 'json-schema-2020-12'
    )[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

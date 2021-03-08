import { FormatLookup } from '../types';
import { isAsyncApiv2 } from './asyncapi';
import {
  isJSONSchema,
  isJSONSchemaDraft2019_09,
  isJSONSchemaDraft6,
  isJSONSchemaDraft7,
  isJSONSchemaLoose,
} from './json-schema';
import { isOpenApiv2, isOpenApiv3, isOpenApiv3_0, isOpenApiv3_1 } from './openapi';

export const KNOWN_FORMATS: Array<[string, FormatLookup, string]> = [
  ['oas2', isOpenApiv2, 'OpenAPI 2.0 (Swagger)'],
  ['oas3', isOpenApiv3, 'OpenAPI 3.x'],
  ['oas3.0', isOpenApiv3_0, 'OpenAPI 3.0'],
  ['oas3.1', isOpenApiv3_1, 'OpenAPI 3.1'],
  ['asyncapi2', isAsyncApiv2, 'AsyncAPI 2.x'],
  ['json-schema', isJSONSchema, 'JSON Schema'],
  ['json-schema-loose', isJSONSchemaLoose, 'JSON Schema (loose)'],
  ['json-schema-draft6', isJSONSchemaDraft6, 'JSON Schema Draft 6'],
  ['json-schema-draft7', isJSONSchemaDraft7, 'JSON Schema Draft 7'],
  ['json-schema-2019-09', isJSONSchemaDraft2019_09, 'JSON Schema Draft 2019-09'],
];

export const KNOWN_RULESETS = ['spectral:oas', 'spectral:asyncapi'];

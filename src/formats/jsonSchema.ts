import { isObject } from 'lodash';
import { JSONSchema } from '../types';

const KNOWN_JSON_SCHEMA_TYPES = ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'];
const KNOWN_JSON_SCHEMA_COMPOUND_KEYWORDS = ['allOf', 'oneOf', 'anyOf', 'not', 'if'];

const SCHEMA_DRAFT_REGEX = /^https?:\/\/json-schema.org\/(?:draft-0([467])|draft\/(20(?:19-09|20-12)))\/(?:hyper-)?schema#?$/;

const hasValidJSONSchemaType = (document: Partial<{ type?: unknown }>): boolean => {
  if (!('type' in document)) return false;
  if (typeof document.type === 'string') {
    return KNOWN_JSON_SCHEMA_TYPES.includes(document.type);
  }

  return Array.isArray(document.type) && document.type.every(type => KNOWN_JSON_SCHEMA_TYPES.includes(type));
};

const hasValidJSONSchemaCompoundKeyword = (document: object): boolean =>
  KNOWN_JSON_SCHEMA_COMPOUND_KEYWORDS.some(combiner => combiner in document && isObject(document[combiner]));

function hasSchemaVersion(document: unknown): document is JSONSchema & { $schema: string } {
  return (
    isObject(document) &&
    '$schema' in document &&
    typeof (document as Partial<{ $schema: unknown }>).$schema === 'string'
  );
}

export const isJSONSchema = (document: unknown): document is JSONSchema & { $schema: string } =>
  hasSchemaVersion(document) && document.$schema.includes('//json-schema.org/');

export const isJSONSchemaLoose = (document: unknown): boolean =>
  isObject(document) &&
  (isJSONSchema(document) || hasValidJSONSchemaType(document) || hasValidJSONSchemaCompoundKeyword(document));

export const isJSONSchemaDraft4 = createJSONSchemaDraftMatcher('draft4');
export const isJSONSchemaDraft6 = createJSONSchemaDraftMatcher('draft6');
export const isJSONSchemaDraft7 = createJSONSchemaDraftMatcher('draft7');
export const isJSONSchemaDraft2019_09 = createJSONSchemaDraftMatcher('draft2019-09');
export const isJSONSchemaDraft2020_12 = createJSONSchemaDraftMatcher('draft2020-12');

function createJSONSchemaDraftMatcher(draft: string) {
  return (document: unknown): boolean => isJSONSchema(document) && extractDraftVersion(document.$schema) === draft;
}

export function extractDraftVersion($schema: string): string | null {
  const match = SCHEMA_DRAFT_REGEX.exec($schema);
  return match !== null ? `draft${match[1] ?? match[2]}` : null;
}

export function detectDialect(document: unknown): string | null {
  if (!isJSONSchema(document)) {
    return null;
  }

  return extractDraftVersion(document.$schema);
}

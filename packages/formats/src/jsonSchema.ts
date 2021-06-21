import type { Format } from '@stoplight/spectral-core';
import { isPlainObject } from '@stoplight/json';
import type { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';

const KNOWN_JSON_SCHEMA_TYPES = ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'];
const KNOWN_JSON_SCHEMA_COMPOUND_KEYWORDS = ['allOf', 'oneOf', 'anyOf', 'not', 'if'];

const SCHEMA_DRAFT_REGEX =
  /^https?:\/\/json-schema.org\/(?:draft-0([467])|draft\/(20(?:19-09|20-12)))\/(?:hyper-)?schema#?$/;

const hasValidJSONSchemaType = (document: Partial<{ type?: unknown }>): boolean => {
  if (!('type' in document)) return false;
  if (typeof document.type === 'string') {
    return KNOWN_JSON_SCHEMA_TYPES.includes(document.type);
  }

  return Array.isArray(document.type) && document.type.every(type => KNOWN_JSON_SCHEMA_TYPES.includes(type));
};

const hasValidJSONSchemaCompoundKeyword = (document: Record<string, unknown>): boolean =>
  KNOWN_JSON_SCHEMA_COMPOUND_KEYWORDS.some(
    combiner => combiner in document && typeof document[combiner] === 'object' && document[combiner] !== null,
  );

function hasSchemaVersion(document: unknown): document is JSONSchema & { $schema: string } {
  return (
    isPlainObject(document) &&
    '$schema' in document &&
    typeof (document as Partial<{ $schema: unknown }>).$schema === 'string'
  );
}

type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;

const isJsonSchema = (document: unknown): document is Record<string, unknown> & { $schema: string } =>
  hasSchemaVersion(document) && document.$schema.includes('//json-schema.org/');

export const jsonSchema: Format<Record<string, unknown> & { $schema: string }> = isJsonSchema;

jsonSchema.displayName = 'JSON Schema';

export const jsonSchemaLoose: Format<Record<string, unknown>> = (
  document: unknown,
): document is Record<string, unknown> =>
  isPlainObject(document) &&
  (isJsonSchema(document) || hasValidJSONSchemaType(document) || hasValidJSONSchemaCompoundKeyword(document));

jsonSchemaLoose.displayName = 'JSON Schema (loose)';

export const jsonSchemaDraft4 = createJsonSchemaFormat<JSONSchema4>('draft4', 'JSON Schema Draft 4');
export const jsonSchemaDraft6 = createJsonSchemaFormat<JSONSchema6>('draft6', 'JSON Schema Draft 6');
export const jsonSchemaDraft7 = createJsonSchemaFormat<JSONSchema7>('draft7', 'JSON Schema Draft 7');
export const jsonSchemaDraft2019_09 = createJsonSchemaFormat<Record<string, unknown>>(
  'draft2019-09',
  'JSON Schema Draft 2019-09',
);
export const jsonSchemaDraft2020_12 = createJsonSchemaFormat<Record<string, unknown>>(
  'draft2020-12',
  'JSON Schema Draft 2020-12',
);

function createJsonSchemaFormat<D = null>(draft: string, name: string): Format<D> {
  const format: Format = (document: unknown): document is D =>
    isJsonSchema(document) && extractDraftVersion(document.$schema) === draft;
  format.displayName = name;
  return format as Format<D>;
}

export function extractDraftVersion($schema: string): string | null {
  const match = SCHEMA_DRAFT_REGEX.exec($schema);
  return match !== null ? `draft${match[1] ?? match[2]}` : null;
}

export function detectDialect(document: unknown): string | null {
  if (!isJsonSchema(document)) {
    return null;
  }

  return extractDraftVersion(document.$schema);
}

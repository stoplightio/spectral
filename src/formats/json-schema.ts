import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import { isObject } from '../utils/isObject';

type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;

const KNOWN_JSON_SCHEMA_TYPES = ['any', 'array', 'boolean', 'integer', 'null', 'number', 'object', 'string'];
const KNOWN_JSON_SCHEMA_COMBINERS = ['allOf', 'oneOf', 'anyOf'];
const $SCHEMA_DRAFT4_REGEX = /^https?:\/\/json-schema.org\/draft-04\/(?:hyper-)?schema#?$/;
const $SCHEMA_DRAFT6_REGEX = /^https?:\/\/json-schema.org\/draft-06\/(?:hyper-)?schema#?$/;
const $SCHEMA_DRAFT7_REGEX = /^https?:\/\/json-schema.org\/draft-07\/(?:hyper-)?schema#?$/;

const hasValidJSONSchemaType = (document: object | Partial<{ type: unknown }>) =>
  'type' in document && typeof document.type === 'string' && KNOWN_JSON_SCHEMA_TYPES.includes(document.type);

const hasValidJSONSchemaCombiner = (document: object) =>
  KNOWN_JSON_SCHEMA_COMBINERS.some(combiner => combiner in document && isObject(document[combiner]));

export const isJSONSchema = (document: unknown): document is JSONSchema & { $schema: string } =>
  isObject(document) &&
  '$schema' in document &&
  String((document as Partial<Pick<JSONSchema, '$schema'>>).$schema).includes('//json-schema.org/');

export const isJSONSchemaLoose = (document: unknown) =>
  isObject(document) &&
  (isJSONSchema(document) ||
    hasValidJSONSchemaType(document) ||
    hasValidJSONSchemaCombiner(document) ||
    'not' in document);

export const isJSONSchemaDraft4 = (document: unknown) =>
  isJSONSchema(document) && $SCHEMA_DRAFT4_REGEX.test(document.$schema);

export const isJSONSchemaDraft6 = (document: unknown) =>
  isJSONSchema(document) && $SCHEMA_DRAFT6_REGEX.test(document.$schema);

export const isJSONSchemaDraft7 = (document: unknown) =>
  isJSONSchema(document) && $SCHEMA_DRAFT7_REGEX.test(document.$schema);

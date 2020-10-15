import { isObject } from 'lodash';
import { JSONSchema } from '../types';

const KNOWN_JSON_SCHEMA_TYPES = ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'];
const KNOWN_JSON_SCHEMA_COMBINERS = ['allOf', 'oneOf', 'anyOf'];
const $SCHEMA_DRAFT4_REGEX = /^https?:\/\/json-schema.org\/draft-04\/(?:hyper-)?schema#?$/;
const $SCHEMA_DRAFT6_REGEX = /^https?:\/\/json-schema.org\/draft-06\/(?:hyper-)?schema#?$/;
const $SCHEMA_DRAFT7_REGEX = /^https?:\/\/json-schema.org\/draft-07\/(?:hyper-)?schema#?$/;
const $SCHEMA_DRAFT_2019_09_REGEX = /^https?:\/\/json-schema.org\/draft\/2019-09\/(?:hyper-)?schema#?$/;

const hasValidJSONSchemaType = (document: object | Partial<{ type: unknown }>): boolean =>
  'type' in document && typeof document.type === 'string' && KNOWN_JSON_SCHEMA_TYPES.includes(document.type);

const hasValidJSONSchemaCombiner = (document: object): boolean =>
  KNOWN_JSON_SCHEMA_COMBINERS.some(combiner => combiner in document && isObject(document[combiner]));

export const isJSONSchema = (document: unknown): document is JSONSchema & { $schema: string } =>
  isObject(document) &&
  '$schema' in document &&
  String((document as Partial<Pick<JSONSchema, '$schema'>>).$schema).includes('//json-schema.org/');

export const isJSONSchemaLoose = (document: unknown): boolean =>
  isObject(document) &&
  (isJSONSchema(document) ||
    hasValidJSONSchemaType(document) ||
    hasValidJSONSchemaCombiner(document) ||
    'not' in document);

export const isJSONSchemaDraft4 = (document: unknown): boolean =>
  isJSONSchema(document) && $SCHEMA_DRAFT4_REGEX.test(document.$schema);

export const isJSONSchemaDraft6 = (document: unknown): boolean =>
  isJSONSchema(document) && $SCHEMA_DRAFT6_REGEX.test(document.$schema);

export const isJSONSchemaDraft7 = (document: unknown): boolean =>
  isJSONSchema(document) && $SCHEMA_DRAFT7_REGEX.test(document.$schema);

export const isJSONSchemaDraft2019_09 = (document: unknown): boolean =>
  isJSONSchema(document) && $SCHEMA_DRAFT_2019_09_REGEX.test(document.$schema);

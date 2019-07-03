/*
 * Schema Path is a variant of the normal Schema rule with a slight twist.
 * Instead of passing the rule a schema to validate, there is already a schema
 * somewhere inside the target, and we are just selecting it, and applying it to
 * a given field.
 *
 * The primary use case for this was validating OpenAPI examples
 * against their schema, but this could be used for other things.
 */
import { IFunction, ISchemaPathOptions } from '../types';
import { schema } from './schema';

const { JSONPath } = require('jsonpath-plus');

export const schemaPath: IFunction<ISchemaPathOptions> = (targetVal, opts, paths, otherValues) => {
  if (!targetVal || typeof targetVal !== 'object') return [];

  const { original: object } = otherValues;

  // The subsection of the targetVal which contains the good bit
  const relevantObject = opts.field ? object[opts.field] : object;
  if (!relevantObject) return [];

  // The subsection of the targetValue which contains the schema for us to validate the good bit against
  let schemaObject;
  try {
    schemaObject = JSONPath({ path: opts.schemaPath, json: object })[0];
  } catch (error) {
    console.error(error);
  }

  return schema(relevantObject, { schema: schemaObject }, paths, otherValues);
};

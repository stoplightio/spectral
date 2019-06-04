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

const jp = require('jsonpath');

export const schemaPath: IFunction<ISchemaPathOptions> = (targetVal, opts, paths, otherValues) => {
  if (!targetVal || typeof targetVal !== 'object') return [];

  let object = targetVal;

  const { resolved } = otherValues;
  if (!resolved) {
    console.warn('schema-path expects a resolved object, but none was provided. Results may not be correct.');
  } else {
    // Take the relevant part of the resolved schema
    object = jp.value(resolved, jp.stringify(['$', ...paths.given]));
  }

  // The subsection of the targetVal which contains the good bit
  const relevantObject = opts.field ? object[opts.field] : object;
  if (!relevantObject) return [];

  // The subsection of the targetValue which contains the schema for us to validate the good bit against
  let schemaObject;
  try {
    schemaObject = jp.value(object, opts.schemaPath);
  } catch (error) {
    console.error(error);
  }

  return schema(relevantObject, { schema: schemaObject }, paths, otherValues);
};

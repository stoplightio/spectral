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

import jp = require('jsonpath');

export const schemaPath: IFunction<ISchemaPathOptions> = (targetVal, opts, paths, otherValues) => {
  if (!targetVal) return [];
  let value = targetVal;

  // We want to run this on a specific field, for example: example
  if (opts.field && typeof targetVal === 'object') {
    value = targetVal[opts.field];
  }

  if (!value) return [];

  // Hunt in the original targetVal for the schema we are going to apply
  let schemaObj;
  try {
    schemaObj = jp.value(targetVal, opts.schemaPath);
  } catch (error) {
    console.error(error);
  }
  if (!schemaObj) return [];

  return schema(value, { schema: schemaObj }, paths, otherValues);
};

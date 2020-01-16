/*
 * Schema Path is a variant of the normal Schema rule with a slight twist.
 * Instead of passing the rule a schema to validate, there is already a schema
 * somewhere inside the target, and we are selecting it, and applying it to
 * a given field.
 *
 * The primary use case for this was validating OpenAPI examples
 * against their schema, but this could be used for other things.
 */
import { Optional } from '@stoplight/types';
import { IFunction, IRule, RuleFunction } from '../types';
import { schema } from './schema';

const { JSONPath } = require('jsonpath-plus');

export interface ISchemaPathOptions {
  schemaPath: string;
  // the `path.to.prop` to field, or special `@key` value to target keys for matched `given` object
  field?: string;
  // The oasVersion, either 2 or 3 for OpenAPI Spec versions, could also be 3.1 or a larger number if there's a need for it, otherwise JSON Schema
  oasVersion?: Optional<number>;
}

export type SchemaPathRule = IRule<RuleFunction.SCHEMAPATH, ISchemaPathOptions>;

export const schemaPath: IFunction<ISchemaPathOptions> = (targetVal, opts, paths, otherValues) => {
  if (!targetVal || typeof targetVal !== 'object') return [];

  const { original: object } = otherValues;

  // The subsection of the targetVal which contains the good bit
  const relevantObject = opts.field ? object[opts.field] : object;
  if (!relevantObject) return [];
  const { target, given } = paths;

  // The subsection of the targetValue which contains the schema for us to validate the good bit against
  let schemaObject;
  try {
    schemaObject = JSONPath({ path: opts.schemaPath, json: object })[0];
  } catch (error) {
    console.error(error);
  }

  if (opts.field) {
    given.push(opts.field);
    if (target) {
      target.push(opts.field);
    }
  }

  return schema(relevantObject, { schema: schemaObject, oasVersion: opts.oasVersion }, paths, otherValues);
};

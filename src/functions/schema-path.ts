/*
 * Schema Path is a variant of the normal Schema rule with a slight twist.
 * Instead of passing the rule a schema to validate, there is already a schema
 * somewhere inside the target, and we are selecting it, and applying it to
 * a given field.
 *
 * The primary use case for this was validating OpenAPI examples
 * against their schema, but this could be used for other things.
 */
import { JSONPath } from 'jsonpath-plus';

import { Optional } from '@stoplight/types';

import { IFunction, IFunctionResult, IRule, RuleFunction } from '../types';
import { getLintTargets } from '../utils';
import { schema } from './schema';

export interface ISchemaPathOptions {
  schemaPath: string;
  // the `path.to.prop` to field, or special `@key` value to target keys for matched `given` object
  field?: string;
  // The oasVersion, either 2 or 3 for OpenAPI Spec versions, could also be 3.1 or a larger number if there's a need for it, otherwise JSON Schema
  oasVersion?: Optional<number>;
  allErrors?: boolean;
}

export type SchemaPathRule = IRule<RuleFunction.SCHEMAPATH, ISchemaPathOptions>;

export const schemaPath: IFunction<ISchemaPathOptions> = (targetVal, opts, paths, otherValues) => {
  // The subsection of the targetVal which contains the good bit
  const relevantItems = getLintTargets(targetVal, opts.field);

  // The subsection of the targetValue which contains the schema for us to validate the good bit against
  const schemaObject = JSONPath({ path: opts.schemaPath, json: targetVal })[0];

  const results: IFunctionResult[] = [];

  for (const relevantItem of relevantItems) {
    const result = schema(
      relevantItem.value,
      {
        schema: schemaObject,
        oasVersion: opts.oasVersion,
        allErrors: opts.allErrors,
      },
      {
        given: paths.given,
        target: [...(paths.target || paths.given), ...relevantItem.path],
      },
      otherValues,
    );

    if (Array.isArray(result)) {
      results.push(...result);
    }
  }

  return results;
};

import { ValidateFunction, ErrorObject } from 'ajv';
import * as betterAjvErrors from '@stoplight/better-ajv-errors';
import { detectDialect } from '@stoplight/spectral-formats';
import { assignAjvInstance } from './ajv';
import { Optional } from '@stoplight/types';
import { draft7 } from 'json-schema-migrate';
import MissingRefError from 'ajv/dist/compile/ref_error';
import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';

// todo: fix
type JSONSchema = any;

export type Options = {
  schema: Record<string, unknown> | JSONSchema;
  allErrors?: boolean;
  dialect?: 'auto' | 'draft4' | 'draft6' | 'draft7' | 'draft2019-09' | 'draft2020-12';
  prepareResults?(errors: ErrorObject[]): void;
};

export default createRulesetFunction<unknown, Options>(
  {
    input: null,
    options: {
      additionalProperties: false,
      properties: {
        schema: {
          type: 'object',
        },
        dialect: {
          enum: ['auto', 'draft4', 'draft6', 'draft7', 'draft2019-09', 'draft2020-12'],
        },
        allErrors: {
          type: 'boolean',
        },
        prepareResults: {},
      },
      required: ['schema'],
      type: 'object',
      errorMessage: {
        type:
          '"schema" function has invalid options specified. Example valid options: { "schema": { /* any JSON Schema can be defined here */ } , { "schema": { "type": "object" }, "dialect": "auto" }',
      },
    },
  },
  function schema(targetVal, opts, paths, { rule }) {
    const path = paths.target ?? paths.given;

    if (targetVal === void 0) {
      return [
        {
          path,
          message: `#{{print("property")}}must exist`,
        },
      ];
    }

    const results: IFunctionResult[] = [];

    // we already access a resolved object in src/functions/schema-path.ts
    const { allErrors = false } = opts;
    let { schema: schemaObj } = opts;

    try {
      let validator;
      const dialect = opts?.dialect ?? detectDialect(schemaObj) ?? 'draft7';
      if (dialect === 'draft4' || dialect === 'draft6') {
        schemaObj = JSON.parse(JSON.stringify(schemaObj)) as Record<string, unknown>;
        schemaObj.$schema = 'http://json-schema.org/draft-07/schema#';
        draft7(schemaObj);
      }

      const ajv = assignAjvInstance(dialect, allErrors);

      const $id = (schemaObj as Record<string, unknown>).$id;

      if (typeof $id !== 'string') {
        validator = ajv.compile(schemaObj);
      } else {
        validator = ajv.getSchema($id) as Optional<ValidateFunction>;
        if (validator === void 0) {
          validator = ajv.compile(schemaObj);
        }
      }

      if (validator?.(targetVal) === false && Array.isArray(validator.errors)) {
        opts.prepareResults?.(validator.errors);

        results.push(
          ...betterAjvErrors(schemaObj, validator.errors, {
            propertyPath: path,
            targetValue: targetVal,
          }).map(({ suggestion, error, path: errorPath }) => ({
            message: suggestion !== void 0 ? `${error}. ${suggestion}` : error,
            path: [...path, ...(errorPath !== '' ? errorPath.replace(/^\//, '').split('/') : [])],
          })),
        );
      }
    } catch (ex) {
      if (!(ex instanceof MissingRefError)) {
        throw ex;
      } else if (!rule.resolved) {
        // let's ignore any $ref errors if schema fn is provided with already resolved content,
        // if our resolver fails to resolve them,
        // ajv is unlikely to do it either, since it won't have access to the whole document, but a small portion of it
        results.push({
          message: ex.message,
          path,
        });
      }
    }

    return results;
  },
);

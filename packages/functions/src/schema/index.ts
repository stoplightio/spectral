import type { ErrorObject } from 'ajv';
import * as betterAjvErrors from '@stoplight/better-ajv-errors';
import { detectDialect } from '@stoplight/spectral-formats';
import { createAjvInstances } from './ajv';
import MissingRefError from 'ajv/dist/compile/ref_error';
import { createRulesetFunction, IFunctionResult, JSONSchema, RulesetFunctionContext } from '@stoplight/spectral-core';
import { isError } from 'lodash';

export type Options = {
  schema: Record<string, unknown> | JSONSchema;
  allErrors?: boolean;
  dialect?: 'auto' | 'draft4' | 'draft6' | 'draft7' | 'draft2019-09' | 'draft2020-12';
  prepareResults?(errors: ErrorObject[]): void;
};

const instances = new WeakMap<RulesetFunctionContext['documentInventory'], ReturnType<typeof createAjvInstances>>();

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
          default: 'auto',
        },
        allErrors: {
          type: 'boolean',
          default: false,
        },
        prepareResults: true,
      },
      required: ['schema'],
      type: 'object',
      errorMessage: {
        type: '"schema" function has invalid options specified. Example valid options: { "schema": { /* any JSON Schema can be defined here */ } , { "schema": { "type": "object" }, "dialect": "auto" }',
      },
    },
  },
  function schema(targetVal, opts, { path, rule, documentInventory }) {
    if (targetVal === void 0) {
      return [
        {
          path,
          message: `#{{print("property")}}must exist`,
        },
      ];
    }

    const assignAjvInstance =
      instances.get(documentInventory) ??
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      instances.set(documentInventory, createAjvInstances()).get(documentInventory)!;

    const results: IFunctionResult[] = [];

    // we already access a resolved object in src/functions/schema-path.ts
    const { allErrors = false, schema: schemaObj } = opts;

    try {
      const dialect =
        (opts.dialect === void 0 || opts.dialect === 'auto' ? detectDialect(schemaObj) : opts?.dialect) ?? 'draft7';

      const validator = assignAjvInstance(schemaObj, dialect, allErrors);

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
      if (!isError(ex)) {
        throw new Error('Unexpected error');
      }

      // let's ignore any $ref errors if schema fn is provided with already resolved content,
      // if our resolver fails to resolve them,
      // ajv is unlikely to do it either, since it won't have access to the whole document, but a small portion of it
      if (!rule.resolved || !(ex instanceof MissingRefError)) {
        results.push({
          message: ex.message,
          path,
        });
      }
    }

    return results;
  },
);

import { ValidateFunction, ErrorObject } from 'ajv';
import * as betterAjvErrors from '@stoplight/better-ajv-errors';
import { IFunction, IFunctionResult } from '../../types/function';
import { detectDialect } from '../../formats';
import MissingRefError from 'ajv/dist/compile/ref_error';
import { assignAjvInstance } from './ajv';
import Ajv, { Options } from 'ajv';
import addFormats from 'ajv-formats';
import { Dictionary } from '@stoplight/types';

export interface ISchemaFunction extends IFunction<ISchemaOptions> {
  createAJVInstance(opts: Options): Ajv;
}

export interface ISchemaOptions {
  schema: object;
  allErrors?: boolean;
  ajv?: ValidateFunction;
  dialect?: 'auto' | 'draft7' | 'draft2019-09' | 'draft2020-12';
  prepareResults?(errors: ErrorObject[]): void;
}

const compiled = new WeakMap<Ajv, Set<string>>();

export const schema: ISchemaFunction = (targetVal, opts, paths, { rule }) => {
  const path = paths.target ?? paths.given;

  if (targetVal === void 0) {
    return [
      {
        path,
        message: `#{{print("property")}}does not exist`,
      },
    ];
  }

  const results: IFunctionResult[] = [];

  // we already access a resolved object in src/functions/schema-path.ts
  const { schema: schemaObj } = opts;

  let validator = opts.ajv;

  try {
    if (validator === void 0) {
      // we used the compiled validation now, hence this lookup here (see the logic above for more info)
      const ajv = assignAjvInstance(opts?.dialect ?? detectDialect(schemaObj) ?? 'draft7');

      let seenSchemas = compiled.get(ajv);
      if (seenSchemas === void 0) {
        seenSchemas = new Set();
        compiled.set(ajv, seenSchemas);
      }

      const $id = (schemaObj as Dictionary<unknown>).$id;

      if (typeof $id !== 'string') {
        validator = ajv.compile(schemaObj);
      } else if (!seenSchemas.has($id)) {
        validator = ajv.compile(schemaObj);
        seenSchemas.add($id);
      } else {
        validator = ajv.getSchema($id) as ValidateFunction;
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
};

// eslint-disable-next-line @typescript-eslint/unbound-method
schema.createAJVInstance = (opts: Options): Ajv => {
  const ajv = new Ajv(opts);
  addFormats(ajv);
  return ajv;
};

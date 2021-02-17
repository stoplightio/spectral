import { Optional } from '@stoplight/types';
import Ajv, { Options as AjvOptions, ErrorObject, ValidateFunction } from 'ajv';
import * as jsonSpecV6 from 'ajv/lib/refs/json-schema-draft-06.json';
import * as jsonSpecV7 from 'ajv/lib/refs/json-schema-draft-07.json';
import * as jsonSpec201909 from 'ajv/lib/refs/json-schema-2019-09';
import * as betterAjvErrors from '@stoplight/better-ajv-errors';
import { IFunction, IFunctionResult, JSONSchema } from '../types';
export interface ISchemaFunction extends IFunction<ISchemaOptions> {
  Ajv: typeof Ajv;
  specs: {
    v6: typeof jsonSpecV6;
    v7: typeof jsonSpecV7;
    v201909: typeof jsonSpec201909;
  };
  createAJVInstance(opts: AjvOptions): Ajv;
}

export interface ISchemaOptions {
  schema: object;
  // The oasVersion, either 2 or 3 for OpenAPI Spec versions, could also be 3.1 or a larger number if there's a need for it, otherwise JSON Schema
  oasVersion?: Optional<2 | 3 | 3.1>;
  allErrors?: boolean;
  ajv?: ValidateFunction;

  // this is used by oasDocumentSchema function, to be removed once we sort out
  prepareResults?(errors: ErrorObject[]): void;
}

const logger = {
  warn(...args: unknown[]): void {
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      if (firstArg.startsWith('unknown format')) return;
      console.warn(...args);
    }
  },
  log: console.log,
  error: console.error,
};

const ajvInstances = {};

function getAjv(oasVersion: Optional<number>, allErrors: Optional<boolean>): Ajv {
  const qual = allErrors === true ? '-all' : '';
  const type: string = (oasVersion !== void 0 && oasVersion >= 2 ? 'oas' + oasVersion : 'jsonschema') + qual;
  if (typeof ajvInstances[type] !== 'undefined') {
    return ajvInstances[type];
  }

  const ajvOpts: AjvOptions = {
    allErrors,
    logger,
    // TODO: OAS3.1 no longer validates format by default. We could, but ajv-oai does not support OAS3.1, so decide to not, or fix.
    validateFormats: false,
  };

  const ajv = schema.createAJVInstance(ajvOpts);

  /* eslint @typescript-eslint/ban-ts-ignore: 0 */
  // @ts-ignore
  ajv._opts.defaultMeta = jsonSpec201909.id;
  // @ts-ignore
  ajv._refs['http://json-schema.org/schema'] = 'https://json-schema.org/draft/2019-09/schema';

  ajvInstances[type] = ajv;
  return ajv;
}

function getSchemaId(schemaObj: JSONSchema): void | string {
  if ('$id' in schemaObj) {
    return schemaObj.$id;
  }
}

const validators = new (class extends WeakMap<JSONSchema, ValidateFunction> {
  public get({ schema: schemaObj, oasVersion, allErrors }: ISchemaOptions): ValidateFunction {
    const ajv = getAjv(oasVersion, allErrors);
    const schemaId = getSchemaId(schemaObj);
    let validator;
    try {
      validator = schemaId !== void 0 ? ajv.getSchema(schemaId) : void 0;
    } catch {
      validator = void 0;
    }

    if (validator !== void 0) {
      return validator;
    }

    validator = super.get(schemaObj);
    if (validator === void 0) {
      // compiling might give us some perf improvements
      validator = ajv.compile(schemaObj);
      super.set(schemaObj, validator);
    }

    return validator;
  }
})();

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

  try {
    // we used the compiled validation now, hence this lookup here (see the logic above for more info)
    const validator = opts.ajv ?? validators.get(opts);
    if (validator(targetVal) === false && Array.isArray(validator.errors)) {
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
    if (!(ex instanceof Ajv.MissingRefError)) {
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

schema.Ajv = Ajv;
// eslint-disable-next-line @typescript-eslint/unbound-method
schema.createAJVInstance = (opts: AjvOptions): Ajv => {
  const ajv = new Ajv(opts);

  // ajv.addFormat('int32', { type: 'number', validate: int32 });
  // ajv.addFormat('int64', { type: 'number', validate: int64 });
  // ajv.addFormat('float', { type: 'number', validate: float });
  // ajv.addFormat('double', { type: 'number', validate: double });
  // ajv.addFormat('byte', { type: 'string', validate: byte });

  return ajv;
};

schema.specs = {
  v6: jsonSpecV6,
  v7: jsonSpecV7,
  v201909: jsonSpec201909,
};

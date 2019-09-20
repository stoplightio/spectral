import * as AJV from 'ajv';
import { ValidateFunction } from 'ajv';
import * as jsonSpecv4 from 'ajv/lib/refs/json-schema-draft-04.json';
import * as jsonSpecv6 from 'ajv/lib/refs/json-schema-draft-06.json';
import * as jsonSpecv7 from 'ajv/lib/refs/json-schema-draft-07.json';
import { IOutputError } from 'better-ajv-errors';
import { JSONSchema4, JSONSchema6 } from 'json-schema';
import { IFunction, IFunctionResult, ISchemaOptions } from '../types';
const oasFormatValidator = require('ajv-oai/lib/format-validator');
const betterAjvErrors = require('better-ajv-errors/lib/modern');

interface IAJVOutputError extends IOutputError {
  path?: string;
}

const logger = {
  warn(...args: any[]) {
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      if (firstArg.startsWith('unknown format')) return;
      console.warn(...args);
    }
  },
  log: console.log,
  error: console.error,
};

const ajv = new AJV({
  meta: false,
  schemaId: 'auto',
  jsonPointers: true,
  unknownFormats: 'ignore',
  logger,
});
ajv.addMetaSchema(jsonSpecv4);
ajv.addMetaSchema(jsonSpecv6);
ajv.addMetaSchema(jsonSpecv7);
// @ts-ignore
ajv._opts.defaultMeta = jsonSpecv4.id;
// @ts-ignore
ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';

ajv.addFormat('int32', { type: 'number', validate: oasFormatValidator.int32 });
ajv.addFormat('int64', { type: 'number', validate: oasFormatValidator.int64 });
ajv.addFormat('float', { type: 'number', validate: oasFormatValidator.float });
ajv.addFormat('double', { type: 'number', validate: oasFormatValidator.double });
ajv.addFormat('byte', { type: 'string', validate: oasFormatValidator.byte });

function getSchemaId(schemaObj: JSONSchema4 | JSONSchema6): void | string {
  if ('$id' in schemaObj) {
    return schemaObj.$id;
  }

  if ('id' in schemaObj) {
    return schemaObj.id;
  }
}

const validators = new class extends WeakMap<JSONSchema4 | JSONSchema6, ValidateFunction> {
  public get(schemaObj: JSONSchema4 | JSONSchema6) {
    const schemaId = getSchemaId(schemaObj);
    let validator = schemaId !== void 0 ? ajv.getSchema(schemaId) : void 0;
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
}();

const cleanAJVErrorMessage = (message: string) => message.trim().replace(/^[^:]*:\s*/, '');

export const schema: IFunction<ISchemaOptions> = (targetVal, opts, paths) => {
  const results: IFunctionResult[] = [];

  const path = paths.target || paths.given;

  if (!targetVal)
    return [
      {
        path,
        message: `${paths ? path.join('.') : 'property'} does not exist`,
      },
    ];

  // we already access a resolved object in src/functions/schema-path.ts
  const { schema: schemaObj } = opts;

  try {
    // we used the compiled validation now, hence this lookup here (see the logic above for more info)
    const validator = validators.get(schemaObj);
    if (!validator(targetVal) && validator.errors) {
      results.push(
        ...(betterAjvErrors(schemaObj, targetVal, validator.errors, { format: 'js' }) as IAJVOutputError[]).map(
          ({ error, path: errorPath }) => {
            return {
              message: cleanAJVErrorMessage(error),
              path: [...path, ...(errorPath ? errorPath.replace(/^\//, '').split('/') : [])],
            };
          },
        ),
      );
    }
  } catch (ex) {
    if (ex instanceof AJV.MissingRefError) {
      results.push({
        message: ex.message,
        path,
      });
    } else {
      throw ex;
    }
  }

  return results;
};

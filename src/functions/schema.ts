import * as AJV from 'ajv';
import * as jsonSpecv4 from 'ajv/lib/refs/json-schema-draft-04.json';
const oasFormatValidator = require('ajv-oai/lib/format-validator');
import { ValidateFunction } from 'ajv';
import { IOutputError } from 'better-ajv-errors';
import { IFunction, IFunctionResult, ISchemaOptions } from '../types';
const betterAjvErrors = require('better-ajv-errors');

const ajv = new AJV({
  meta: false,
  schemaId: 'auto',
  jsonPointers: true,
  unknownFormats: 'ignore',
});
ajv.addMetaSchema(jsonSpecv4);
// @ts-ignore
ajv._opts.defaultMeta = jsonSpecv4.id;
// @ts-ignore
ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';

ajv.addFormat('int32', { type: 'number', validate: oasFormatValidator.int32 });
ajv.addFormat('int64', { type: 'number', validate: oasFormatValidator.int64 });
ajv.addFormat('float', { type: 'number', validate: oasFormatValidator.float });
ajv.addFormat('double', { type: 'number', validate: oasFormatValidator.double });
ajv.addFormat('byte', { type: 'string', validate: oasFormatValidator.byte });

const validators = new class extends WeakMap<object, ValidateFunction> {
  public get(schemaObj: object) {
    let validator = super.get(schemaObj);
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
        ...(betterAjvErrors(schemaObj, targetVal, validator.errors, { format: 'js' }) as IOutputError[]).map(
          ({ error }) => ({
            message: cleanAJVErrorMessage(error),
            path,
          }),
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

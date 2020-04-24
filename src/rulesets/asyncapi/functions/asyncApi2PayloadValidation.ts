import { ValidateFunction } from 'ajv';

import { ISchemaFunction } from '../../../functions/schema';
import { IFunction, IFunctionContext } from '../../../types';

const fakeSchemaObjectId = 'asyncapi2#schemaObject';
const asyncApi2SchemaObject = { $ref: fakeSchemaObjectId };

let validator: ValidateFunction;

const buildAsyncApi2SchemaObjectValidator = (schemaFn: ISchemaFunction, asyncApi2Schema: any): ValidateFunction => {
  if (validator !== void 0) {
    return validator;
  }

  const ajv = schemaFn.createAJVInstance({
    meta: false,
    jsonPointers: true,
    allErrors: true,
  });

  ajv.addMetaSchema(schemaFn.specs.v7);
  ajv.addSchema(asyncApi2Schema, asyncApi2Schema.$id);

  validator = ajv.compile(asyncApi2SchemaObject);

  return validator;
};

export interface IAsyncApi2PayloadValidationOptions {
  asyncApi2Schema: object;
}

export const asyncApi2PayloadValidation: IFunction<IAsyncApi2PayloadValidationOptions> = function(
  this: IFunctionContext,
  targetVal,
  opts,
  paths,
  otherValues,
) {
  const ajvValidationFn = buildAsyncApi2SchemaObjectValidator(this.functions.schema, opts.asyncApi2Schema);

  const results = this.functions.schema(
    targetVal,
    {
      schema: asyncApi2SchemaObject,
      ajv: ajvValidationFn,
      allErrors: true,
    },
    paths,
    otherValues,
  );

  if (!Array.isArray(results)) {
    return [];
  }

  return results;
};

export default asyncApi2PayloadValidation;

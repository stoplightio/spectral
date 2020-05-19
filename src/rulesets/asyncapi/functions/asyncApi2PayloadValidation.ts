import { ValidateFunction } from 'ajv';

import { ISchemaFunction } from '../../../functions/schema';
import { IFunction, IFunctionContext } from '../../../types';
import * as asyncApi2Schema from '../schemas/schema.asyncapi2.json';

const fakeSchemaObjectId = 'asyncapi2#schemaObject';
const asyncApi2SchemaObject = { $ref: fakeSchemaObjectId };

let validator: ValidateFunction;

const buildAsyncApi2SchemaObjectValidator = (schemaFn: ISchemaFunction): ValidateFunction => {
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

export const asyncApi2PayloadValidation: IFunction<null> = function (
  this: IFunctionContext,
  targetVal,
  _opts,
  paths,
  otherValues,
) {
  const ajvValidationFn = buildAsyncApi2SchemaObjectValidator(this.functions.schema);

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

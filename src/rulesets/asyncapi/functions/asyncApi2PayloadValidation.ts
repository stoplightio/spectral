import { ValidateFunction } from 'ajv';

import { ISchemaFunction } from '../../../functions/schema';
import { IFunction, IFunctionContext, IFunctionPaths } from '../../../types';

const fakeSchemaObjectId = 'asyncapi2#schemaObject';
const asyncApi2SchemaObject = { $ref: fakeSchemaObjectId };

let validator: ValidateFunction;

export const supportedSchemaFormats = [
  undefined,
  'application/vnd.aai.asyncapi;version=2.0.0',
  'application/vnd.aai.asyncapi+json;version=2.0.0',
  'application/vnd.aai.asyncapi+yaml;version=2.0.0',
];

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
  if (!supportedSchemaFormats.includes(targetVal.schemaFormat)) {
    // silently ignore unsupported schemaFormat values
    return [];
  }

  const payload = targetVal.payload;
  if (payload === void 0) {
    return [];
  }

  const ajvValidationFn = buildAsyncApi2SchemaObjectValidator(this.functions.schema, opts.asyncApi2Schema);

  const refinedPaths: IFunctionPaths = { target: [], given: paths.given };
  Array.prototype.push.apply(refinedPaths.target, paths.target || paths.given);
  refinedPaths.target!.push('payload');

  const results = this.functions.schema(
    payload,
    {
      schema: asyncApi2SchemaObject,
      ajv: ajvValidationFn,
      allErrors: true,
    },
    refinedPaths,
    otherValues,
  );

  if (!Array.isArray(results)) {
    return [];
  }

  return results;
};

export default asyncApi2PayloadValidation;

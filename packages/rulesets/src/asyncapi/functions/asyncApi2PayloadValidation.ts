import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { createRulesetFunction } from '@stoplight/spectral-core';
import * as betterAjvErrors from '@stoplight/better-ajv-errors';
import * as asyncApi2Schema from '../schemas/schema.asyncapi2.json';

const fakeSchemaObjectId = 'asyncapi2#/definitions/schema';
const asyncApi2SchemaObject = { $ref: fakeSchemaObjectId };

const ajv = new Ajv({
  allErrors: true,
  strict: false,
});

addFormats(ajv);

ajv.addSchema(asyncApi2Schema, asyncApi2Schema.$id);

const ajvValidationFn = ajv.compile(asyncApi2SchemaObject);

export default createRulesetFunction<unknown, null>(
  {
    input: null,
    options: null,
  },
  function asyncApi2PayloadValidation(targetVal, _opts, context) {
    ajvValidationFn(targetVal);

    return betterAjvErrors(asyncApi2SchemaObject, ajvValidationFn.errors, {
      propertyPath: context.path,
      targetValue: targetVal,
    }).map(({ suggestion, error, path: errorPath }) => ({
      message: suggestion !== void 0 ? `${error}. ${suggestion}` : error,
      path: [...context.path, ...(errorPath !== '' ? errorPath.replace(/^\//, '').split('/') : [])],
    }));
  },
);

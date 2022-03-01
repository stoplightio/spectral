import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { createRulesetFunction } from '@stoplight/spectral-core';
import betterAjvErrors from '@stoplight/better-ajv-errors';

// use latest AsyncAPI JSON Schema because there are no differences of Schema Object definitions between the 2.X.X.
import * as asyncApi2Schema from '@asyncapi/specs/schemas/2.3.0.json';

const asyncApi2SchemaObject = { $ref: 'asyncapi2#/definitions/schema' };

const ajv = new Ajv({
  allErrors: true,
  strict: false,
});

addFormats(ajv);

ajv.addSchema(asyncApi2Schema, 'asyncapi2');

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

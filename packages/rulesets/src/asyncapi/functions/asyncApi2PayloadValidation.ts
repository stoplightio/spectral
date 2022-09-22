import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { createRulesetFunction } from '@stoplight/spectral-core';
import { aas2_0, aas2_1, aas2_2, aas2_3, aas2_4, aas2_5 } from '@stoplight/spectral-formats';
import betterAjvErrors from '@stoplight/better-ajv-errors';

import { getCopyOfSchema } from './utils/specs';

import type { ValidateFunction } from 'ajv';
import type { Format } from '@stoplight/spectral-core';
import type { AsyncAPISpecVersion } from './utils/specs';

const asyncApi2SchemaObject = { $ref: 'asyncapi2#/definitions/schema' };

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  logger: false,
});
addFormats(ajv);

/**
 * To validate the schema of the payload we just need a small portion of official AsyncAPI spec JSON Schema, the Schema Object in particular. The definition of Schema Object must be
 * included in the returned JSON Schema.
 */
function preparePayloadSchema(version: AsyncAPISpecVersion): Record<string, unknown> {
  // Copy to not operate on the original json schema - between imports (in different modules) we operate on this same schema.
  const copied = getCopyOfSchema(version) as { definitions: Record<string, unknown> };
  // Remove the meta schemas because they are already present within Ajv, and it's not possible to add duplicated schemas.
  delete copied.definitions['http://json-schema.org/draft-07/schema'];
  delete copied.definitions['http://json-schema.org/draft-04/schema'];

  const payloadSchema = `http://asyncapi.com/definitions/${version}/schema.json`;

  return {
    $ref: payloadSchema,
    definitions: copied.definitions,
  };
}

function getValidator(version: AsyncAPISpecVersion): ValidateFunction {
  let validator = ajv.getSchema(version);
  if (!validator) {
    const schema = preparePayloadSchema(version);

    ajv.addSchema(schema, version);
    validator = ajv.getSchema(version);
  }

  return validator as ValidateFunction;
}

function getSchemaValidator(formats: Set<Format>): ValidateFunction | void {
  switch (true) {
    case formats.has(aas2_5):
      return getValidator('2.5.0');
    case formats.has(aas2_4):
      return getValidator('2.4.0');
    case formats.has(aas2_3):
      return getValidator('2.3.0');
    case formats.has(aas2_2):
      return getValidator('2.2.0');
    case formats.has(aas2_1):
      return getValidator('2.1.0');
    case formats.has(aas2_0):
      return getValidator('2.0.0');
    default:
      return;
  }
}

export default createRulesetFunction<unknown, null>(
  {
    input: null,
    options: null,
  },
  function asyncApi2PayloadValidation(targetVal, _, context) {
    const formats = context.document?.formats;
    if (formats === null || formats === void 0) return;

    const validator = getSchemaValidator(formats);
    if (validator === void 0) return;

    validator(targetVal);
    return betterAjvErrors(asyncApi2SchemaObject, validator.errors, {
      propertyPath: context.path,
      targetValue: targetVal,
    }).map(({ suggestion, error, path: errorPath }) => ({
      message: suggestion !== void 0 ? `${error}. ${suggestion}` : error,
      path: [...context.path, ...(errorPath !== '' ? errorPath.replace(/^\//, '').split('/') : [])],
    }));
  },
);

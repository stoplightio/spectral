import { decodePointerFragment } from '@stoplight/json';
import * as AJV from 'ajv';
import * as jsonSpecv4 from 'ajv/lib/refs/json-schema-draft-04.json';

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

import { AdditionalPropertiesParams } from 'ajv';
import { IFunction, IFunctionResult, ISchemaOptions } from '../types';

const formatPath = (path: string) =>
  path
    .split('/')
    .slice(1)
    .map(decodePointerFragment);

const mergeErrors = (existingError: IFunctionResult, newError: AJV.ErrorObject) => {
  switch (newError.keyword) {
    case 'additionalProperties': {
      const { additionalProperty } = newError.params as AdditionalPropertiesParams;
      if (!new RegExp(`[:,] ${additionalProperty}`).test(existingError.message)) {
        existingError.message += `, ${(newError.params as AdditionalPropertiesParams).additionalProperty}`;
      }
      return true;
    }
    default:
      return existingError.message === newError.message;
  }
};

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

  const { schema: schemaObj } = opts;

  if (!ajv.validate(schemaObj, targetVal) && ajv.errors) {
    // TODO: potential performance improvements (compile, etc)?
    const collectedErrors: string[] = [];

    for (const error of ajv.errors) {
      if (collectedErrors.length > 0) {
        const index = collectedErrors.indexOf(error.keyword);
        if (index !== -1) {
          if (mergeErrors(results[index], error)) continue;
        }
      }

      let message = error.message || '';

      if (error.keyword === 'additionalProperties' && (error.params as AdditionalPropertiesParams).additionalProperty) {
        message += `: ${(error.params as AdditionalPropertiesParams).additionalProperty}`;
      }

      collectedErrors.push(error.keyword);
      results.push({
        path: [...path, ...formatPath(error.dataPath)],
        message,
      });
    }
  }

  return results;
};

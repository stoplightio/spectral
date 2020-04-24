import { IFunction, IFunctionContext } from '../../../types';
import { isSchemaFormatSupported } from './asyncApi2PayloadValidation';

export interface IAsyncApi2SchemaPathOptions {
  schemaPath: string;
  // the `path.to.prop` to field, or special `@key` value to target keys for matched `given` object
  field: string;
}

export const asyncApi2SchemaPath: IFunction<IAsyncApi2SchemaPathOptions> = function(
  this: IFunctionContext,
  targetVal,
  opts,
  paths,
  otherValues,
) {
  if (!isSchemaFormatSupported(targetVal.schemaFormat)) {
    // silently ignore unsupported schemaFormat values
    return [];
  }

  const results = this.functions.schemaPath(
    targetVal,
    {
      schemaPath: opts.schemaPath,
      field: opts.field,
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

export default asyncApi2SchemaPath;

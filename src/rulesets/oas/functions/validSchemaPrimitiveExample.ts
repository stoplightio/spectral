import { IFunction, IFunctionContext } from '../../../types';

export const validSchemaPrimitiveExample: IFunction = function(
  this: IFunctionContext,
  targetVal,
  opts,
  paths,
  otherValues,
) {
  if (targetVal === null || typeof targetVal !== 'object') return;
  if (paths.given.length === 0 && paths.given[paths.given.length - 1] === 'properties') return;
  if ('example' in targetVal && ('type' in targetVal || 'format' in targetVal || '$ref' in targetVal)) {
    return this.functions.schemaPath.call(this, targetVal, opts, paths, otherValues);
  }

  return;
};

export default validSchemaPrimitiveExample;

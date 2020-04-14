import { IFunction, IFunctionContext } from '../../../types';

export const validSchemaExample: IFunction = function(this: IFunctionContext, targetVal, opts, paths, otherValues) {
  if (targetVal === null || typeof targetVal !== 'object') return;
  if ('example' in targetVal && 'schema' in targetVal) {
    return this.functions.schemaPath.call(this, targetVal, opts, paths, otherValues);
  }

  return;
};

export default validSchemaExample;

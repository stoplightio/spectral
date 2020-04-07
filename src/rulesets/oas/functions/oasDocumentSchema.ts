import * as AJV from 'ajv';
import { ISchemaOptions } from '../../../functions/schema';
import { IFunction, IFunctionContext } from '../../../types';

// /shrug
function prepareResults(errors: AJV.ErrorObject[]) {
  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];

    if (i + 1 < errors.length && errors[i + 1].dataPath === error.dataPath) {
      errors.splice(i + 1, 1);
      i--;
    } else if (
      i > 0 &&
      error.keyword === 'required' &&
      (error.params as AJV.RequiredParams).missingProperty === '$ref' &&
      errors[i - 1].dataPath.startsWith(error.dataPath)
    ) {
      errors.splice(i, 1);
      i--;
    }
  }
}

export const oasDocumentSchema: IFunction<ISchemaOptions> = function(this: IFunctionContext, targetVal, opts, ...args) {
  return this.functions.schema.call(this, targetVal, { ...opts, prepareResults }, ...args);
};

export default oasDocumentSchema;

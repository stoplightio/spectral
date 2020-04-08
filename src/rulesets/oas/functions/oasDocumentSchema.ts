import * as AJV from 'ajv';
import { ISchemaOptions } from '../../../functions/schema';
import { IFunction, IFunctionContext, IFunctionResult } from '../../../types';

function shouldIgnoreError(error: AJV.ErrorObject) {
  return (
    error.keyword === 'oneOf' ||
    (error.keyword === 'required' && (error.params as AJV.RequiredParams).missingProperty === '$ref')
  );
}

// this is supposed to cover edge cases, when it's impossible to detect the most appropriate error, i.e. oneOf consisting of more than 3 members, etc.
const ERROR_MAP = [
  {
    path: /^components\/securitySchemes\/[^/]+$/,
    message: 'Invalid security scheme',
  },
  {
    path: /^securityDefinitions\/[^/]+$/,
    message: 'Invalid security definition',
  },
];

// /shrug
function prepareResults(errors: AJV.ErrorObject[]) {
  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];

    if (i + 1 < errors.length && errors[i + 1].dataPath === error.dataPath) {
      errors.splice(i + 1, 1);
      i--;
    } else if (i > 0 && shouldIgnoreError(error) && errors[i - 1].dataPath.startsWith(error.dataPath)) {
      errors.splice(i, 1);
      i--;
    }
  }
}

function applyManualReplacements(errors: IFunctionResult[]) {
  for (const error of errors) {
    if (error.path === void 0) continue;

    const joinedPath = error.path.join('/');

    for (const mappedError of ERROR_MAP) {
      if (mappedError.path.test(joinedPath)) {
        error.message = mappedError.message;
        break;
      }
    }
  }
}

export const oasDocumentSchema: IFunction<ISchemaOptions> = function(this: IFunctionContext, targetVal, opts, ...args) {
  const errors = this.functions.schema.call(this, targetVal, { ...opts, prepareResults }, ...args);

  if (Array.isArray(errors)) {
    applyManualReplacements(errors);
  }

  return errors;
};

export default oasDocumentSchema;

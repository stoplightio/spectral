import * as AJV from 'ajv';
import { ISchemaOptions } from '../../../functions/schema';
import { IFunction, IFunctionContext, IFunctionResult } from '../../../types';

function shouldIgnoreError(error: AJV.ErrorObject): boolean {
  return (
    // oneOf is a fairly error as we have 2 options to choose from for most of the time.
    error.keyword === 'oneOf' ||
    // the required $ref is entirely useless, since oas-schema rules operate on resolved content, so there won't be any $refs in the document
    (error.keyword === 'required' && (error.params as AJV.RequiredParams).missingProperty === '$ref')
  );
}

// this is supposed to cover edge cases we need to cover manually, when it's impossible to detect the most appropriate error, i.e. oneOf consisting of more than 3 members, etc.
// note,  more errors can be included if certain messages reported by AJV are not quite meaningful
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

// The function removes irrelevant (aka misleading, confusing, useless, whatever you call it) errors.
// There are a few exceptions, i.e. security components I covered manually,
// yet apart from them we usually deal with a relatively simple scenario that can be literally expressed as: "either proper value of $ref property".
// The $ref part is never going to be interesting for us, because both oas-schema rules operate on resolved content, so we won't have any $refs left.
// As you can see, what we deal here wit is actually not really oneOf anymore - it's always the first member of oneOf we match against.
// That being said, we always strip both oneOf and $ref, since we are always interested in the first error.
export function prepareResults(errors: AJV.ErrorObject[]) {
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

function applyManualReplacements(errors: IFunctionResult[]): void {
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

export const oasDocumentSchema: IFunction<ISchemaOptions> = function (
  this: IFunctionContext,
  targetVal,
  opts,
  ...args
) {
  const errors = this.functions.schema.call(this, targetVal, { ...opts, prepareResults }, ...args);

  if (Array.isArray(errors)) {
    applyManualReplacements(errors);
  }

  return errors;
};

export default oasDocumentSchema;

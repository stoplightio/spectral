/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-return */
import type { ErrorObject } from 'ajv';
import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import { schema as schemaFn } from '@stoplight/spectral-functions';
import { oas2, oas3_1 } from '@stoplight/spectral-formats';

import * as schemaOas2_0 from '../schemas/2.0.json';
import * as schemaOas3_0 from '../schemas/3.0.json';
import * as schemaOas3_1 from '../schemas/3.1.json';

const OAS_SCHEMAS = {
  '2.0': schemaOas2_0,
  '3.0': schemaOas3_0,
  '3.1': schemaOas3_1,
};

function shouldIgnoreError(error: ErrorObject): boolean {
  return (
    // oneOf is a fairly error as we have 2 options to choose from for most of the time.
    error.keyword === 'oneOf' ||
    // the required $ref is entirely useless, since oas-schema rules operate on resolved content, so there won't be any $refs in the document
    (error.keyword === 'required' && error.params.missingProperty === '$ref')
  );
}

// this is supposed to cover edge cases we need to cover manually, when it's impossible to detect the most appropriate error, i.e. oneOf consisting of more than 3 members, etc.
// note,  more errors can be included if certain messages reported by AJV are not quite meaningful
const ERROR_MAP = [
  {
    path: /^components\/securitySchemes\/[^/]+$/,
    message: 'Invalid security scheme',
  },
];

// The function removes irrelevant (aka misleading, confusing, useless, whatever you call it) errors.
// There are a few exceptions, i.e. security components I covered manually,
// yet apart from them we usually deal with a relatively simple scenario that can be literally expressed as: "either proper value of $ref property".
// The $ref part is never going to be interesting for us, because both oas-schema rules operate on resolved content, so we won't have any $refs left.
// As you can see, what we deal here wit is actually not really oneOf anymore - it's always the first member of oneOf we match against.
// That being said, we always strip both oneOf and $ref, since we are always interested in the first error.
export function prepareResults(errors: ErrorObject[]): void {
  // Update additionalProperties errors to make them more precise and prevent them from being treated as duplicates
  for (const error of errors) {
    if (error.keyword === 'additionalProperties') {
      error.instancePath = `${error.instancePath}/${String(error.params['additionalProperty'])}`;
    }
  }

  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];

    if (i + 1 < errors.length && errors[i + 1].instancePath === error.instancePath) {
      errors.splice(i + 1, 1);
      i--;
    } else if (i > 0 && shouldIgnoreError(error) && errors[i - 1].instancePath.startsWith(error.instancePath)) {
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

export default createRulesetFunction<unknown, null>(
  {
    input: null,
    options: null,
  },
  function oasDocumentSchema(targetVal, opts, paths, otherValues) {
    const formats = otherValues.documentInventory.formats;
    if (formats === null) return;

    const schema = formats.has(oas2)
      ? OAS_SCHEMAS['2.0']
      : formats.has(oas3_1)
      ? OAS_SCHEMAS['3.1']
      : OAS_SCHEMAS['3.0'];

    const errors = schemaFn(targetVal, { allErrors: true, schema, prepareResults }, paths, otherValues);

    if (Array.isArray(errors)) {
      applyManualReplacements(errors);
    }

    return errors;
  },
);

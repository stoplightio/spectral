import { createRulesetFunction } from '@stoplight/spectral-core';
import { schema as schemaFn } from '@stoplight/spectral-functions';
import { aas2_0, aas2_1, aas2_2, aas2_3, aas2_4, aas2_5, aas2_6 } from '@stoplight/spectral-formats';

import { getCopyOfSchema } from './utils/specs';

import type { ErrorObject } from 'ajv';
import type { IFunctionResult, Format } from '@stoplight/spectral-core';
import type { AsyncAPISpecVersion } from './utils/specs';

function shouldIgnoreError(error: ErrorObject): boolean {
  return (
    // oneOf is a fairly error as we have 2 options to choose from for most of the time.
    error.keyword === 'oneOf' ||
    // the required $ref is entirely useless, since aas-schema rules operate on resolved content, so there won't be any $refs in the document
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
// The $ref part is never going to be interesting for us, because both aas-schema rules operate on resolved content, so we won't have any $refs left.
// As you can see, what we deal here wit is actually not really oneOf anymore - it's always the first member of oneOf we match against.
// That being said, we always strip both oneOf and $ref, since we are always interested in the first error.
export function prepareResults(errors: ErrorObject[]): void {
  // Update additionalProperties errors to make them more precise and prevent them from being treated as duplicates
  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];

    if (error.keyword === 'additionalProperties') {
      error.instancePath = `${error.instancePath}/${String(error.params['additionalProperty'])}`;
    } else if (error.keyword === 'required' && error.params.missingProperty === '$ref') {
      errors.splice(i, 1);
      i--;
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

const serializedSchemas = new Map<AsyncAPISpecVersion, Record<string, unknown>>();
function getSerializedSchema(version: AsyncAPISpecVersion): Record<string, unknown> {
  const schema = serializedSchemas.get(version);
  if (schema) {
    return schema;
  }

  // Copy to not operate on the original json schema - between imports (in different modules) we operate on this same schema.
  const copied = getCopyOfSchema(version) as { definitions: Record<string, unknown> };
  // Remove the meta schemas because they are already present within Ajv, and it's not possible to add duplicated schemas.
  delete copied.definitions['http://json-schema.org/draft-07/schema'];
  delete copied.definitions['http://json-schema.org/draft-04/schema'];

  serializedSchemas.set(version, copied);
  return copied;
}

function getSchema(formats: Set<Format>): Record<string, any> | void {
  switch (true) {
    case formats.has(aas2_6):
      return getSerializedSchema('2.6.0');
    case formats.has(aas2_5):
      return getSerializedSchema('2.5.0');
    case formats.has(aas2_4):
      return getSerializedSchema('2.4.0');
    case formats.has(aas2_3):
      return getSerializedSchema('2.3.0');
    case formats.has(aas2_2):
      return getSerializedSchema('2.2.0');
    case formats.has(aas2_1):
      return getSerializedSchema('2.1.0');
    case formats.has(aas2_0):
      return getSerializedSchema('2.0.0');
    default:
      return;
  }
}

export default createRulesetFunction<unknown, null>(
  {
    input: null,
    options: null,
  },
  function asyncApi2DocumentSchema(targetVal, _, context) {
    const formats = context.document?.formats;
    if (formats === null || formats === void 0) return;

    const schema = getSchema(formats);
    if (schema === void 0) return;

    const errors = schemaFn(targetVal, { allErrors: true, schema, prepareResults }, context);

    if (Array.isArray(errors)) {
      applyManualReplacements(errors);
    }

    return errors;
  },
);

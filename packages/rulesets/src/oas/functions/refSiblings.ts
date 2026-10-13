import { createRulesetFunction } from '@stoplight/spectral-core';
import type { IFunctionResult } from '@stoplight/spectral-core';
import { oas3_1, oas3_2 } from '@stoplight/spectral-formats';
import type { JsonPath } from '@stoplight/types';
import { isObject } from './utils/isObject';

// As of OAS 3.1, Reference Objects may have "summary" and "description" siblings.
const OAS3_1_ALLOWED_SIBLINGS = ['summary', 'description'];

// Keywords whose value is a Schema Object (itemSchema was added in OAS 3.2).
const SCHEMA_KEYWORDS = ['schema', 'itemSchema'];

function getParentValue(document: unknown, path: JsonPath): unknown {
  if (path.length === 0) {
    return null;
  }

  let piece = document;

  for (let i = 0; i < path.length - 1; i += 1) {
    if (!isObject(piece)) {
      return null;
    }

    piece = piece[path[i]];
  }

  return piece;
}

// Schema Objects in OAS 3.1+ follow JSON Schema 2020-12, where $ref siblings are allowed.
function isWithinSchema(path: JsonPath): boolean {
  if (path.length > 2 && path[0] === 'components' && path[1] === 'schemas') {
    return true;
  }

  // The last segment is "$ref" itself, so it is not considered.
  return path.slice(0, -1).some(segment => typeof segment === 'string' && SCHEMA_KEYWORDS.includes(segment));
}

export default createRulesetFunction<unknown, null>(
  {
    input: null,
    options: null,
  },
  function refSiblings(targetVal, opts, { document, path }) {
    const isOAS3_1Plus = document.formats?.has(oas3_1) === true || document.formats?.has(oas3_2) === true;
    if (isOAS3_1Plus && isWithinSchema(path)) return;

    const value = getParentValue(document.data, path);
    if (!isObject(value)) return;

    const keys = Object.keys(value);
    if (keys.length === 1) {
      return;
    }

    const results: IFunctionResult[] = [];
    const actualObjPath = path.slice(0, -1);

    for (const key of keys) {
      if (key === '$ref') {
        continue;
      }

      if (isOAS3_1Plus) {
        if (OAS3_1_ALLOWED_SIBLINGS.includes(key)) {
          continue;
        }

        results.push({
          message: '$ref must not be placed next to any properties other than "summary" and "description"',
          path: [...actualObjPath, key],
        });
      } else {
        results.push({
          message: '$ref must not be placed next to any other properties',
          path: [...actualObjPath, key],
        });
      }
    }

    return results;
  },
);

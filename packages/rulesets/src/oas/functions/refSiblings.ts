import { createRulesetFunction } from '@stoplight/spectral-core';
import type { IFunctionResult } from '@stoplight/spectral-core';
import { oas3_1, oas3_2 } from '@stoplight/spectral-formats';
import type { JsonPath } from '@stoplight/types';
import { isObject } from './utils/isObject';

// As of OAS 3.1, Reference Objects may have "summary" and "description" siblings.
const OAS3_1_ALLOWED_SIBLINGS = ['summary', 'description'];

// Keys of these maps are user-defined names, so a segment that follows one is a name, not a keyword.
const NAMED_MAPS = [
  'paths',
  'webhooks',
  'callbacks',
  'responses',
  'content',
  'headers',
  'examples',
  'links',
  'encoding',
  'parameters',
  'requestBodies',
  'pathItems',
  'securitySchemes',
  'mediaTypes',
];

// Keywords whose value is not a Reference-bearing OAS structure: Schema Objects (itemSchema was added in OAS 3.2)
// and example data.
const OPAQUE_KEYWORDS = ['schema', 'itemSchema', 'example'];

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

function isKeywordAt(path: JsonPath, i: number): boolean {
  const prev = path[i - 1];
  return i > 0 && !(typeof prev === 'string' && NAMED_MAPS.includes(prev));
}

// Schema Objects in OAS 3.1+ follow JSON Schema 2020-12, where $ref siblings are allowed, and example data is arbitrary.
function isWithinOpaqueValue(path: JsonPath): boolean {
  if (path.length > 2 && path[0] === 'components' && path[1] === 'schemas') {
    return true;
  }

  // The last segment is "$ref" itself, so it is not considered.
  return path.slice(0, -1).some((segment, i) => {
    if (typeof segment !== 'string') return false;
    if (OPAQUE_KEYWORDS.includes(segment)) return isKeywordAt(path, i);
    // examples.<name>.value
    return segment === 'value' && path[i - 2] === 'examples';
  });
}

// Path Item Objects may have siblings next to $ref (only fields defined on both sides are undefined behavior).
function isPathItem(path: JsonPath): boolean {
  const parent = path.slice(0, -1);
  return (
    (parent.length === 2 && (parent[0] === 'paths' || parent[0] === 'webhooks')) ||
    (parent.length === 3 && parent[0] === 'components' && parent[1] === 'pathItems') ||
    parent[parent.length - 3] === 'callbacks'
  );
}

export default createRulesetFunction<unknown, null>(
  {
    input: null,
    options: null,
  },
  function refSiblings(targetVal, opts, { document, path }) {
    const isOAS3_1Plus = document.formats?.has(oas3_1) === true || document.formats?.has(oas3_2) === true;
    if (isOAS3_1Plus && (isWithinOpaqueValue(path) || isPathItem(path))) return;

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

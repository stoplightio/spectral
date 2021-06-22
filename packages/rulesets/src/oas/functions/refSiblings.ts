import type { JsonPath } from '@stoplight/types';
import type { IFunction, IFunctionResult } from '@stoplight/spectral-core';
import { isObject } from './utils/isObject';

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

const refSiblings: IFunction = (targetVal, opts, { document, path }) => {
  const value = getParentValue(document.data, path);

  if (!isObject(value)) {
    return;
  }

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
    results.push({
      message: '$ref cannot be placed next to any other properties',
      path: [...actualObjPath, key],
    });
  }

  return results;
};

export default refSiblings;

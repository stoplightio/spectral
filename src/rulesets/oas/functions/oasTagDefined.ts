// This function will check an API doc to verify that any tag that appears on
// an operation is also present in the global tags array.

import type { IFunction, IFunctionResult } from '../../../types';
import { getAllOperations } from './utils/getAllOperations';
import { isObject } from './utils/isObject';

export const oasTagDefined: IFunction = targetVal => {
  const results: IFunctionResult[] = [];

  const globalTags: string[] = [];

  if (Array.isArray(targetVal.tags)) {
    for (const tag of targetVal.tags) {
      if (isObject(tag) && typeof tag.name === 'string') {
        globalTags.push(tag.name);
      }
    }
  }

  const { paths } = targetVal;

  for (const { path, operation } of getAllOperations(paths)) {
    const { tags } = paths[path][operation];

    if (!Array.isArray(tags)) {
      continue;
    }

    for (const [i, tag] of tags.entries()) {
      if (!globalTags.includes(tag)) {
        results.push({
          message: 'Operation tags should be defined in global tags.',
          path: ['paths', path, operation, 'tags', i],
        });
      }
    }
  }

  return results;
};

export default oasTagDefined;

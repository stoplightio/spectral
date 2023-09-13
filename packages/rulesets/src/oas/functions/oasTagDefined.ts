// This function will check an API doc to verify that any tag that appears on
// an operation is also present in the global tags array.

import type { IFunctionResult } from '@stoplight/spectral-core';
import { createRulesetFunction } from '@stoplight/spectral-core';
import { getAllOperations } from './utils/getAllOperations';
import { isObject } from './utils/isObject';

export default createRulesetFunction<Record<string, unknown>, null>(
  {
    input: {
      type: 'object',
    },
    options: null,
  },
  function oasTagDefined(targetVal) {
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

    for (const { path, operation, value } of getAllOperations(paths)) {
      if (!isObject(value)) continue;

      const { tags } = value;

      if (!Array.isArray(tags)) {
        continue;
      }

      for (const [i, tag] of tags.entries()) {
        if (!globalTags.includes(tag)) {
          results.push({
            message: 'Operation tags must be defined in global tags.',
            path: ['paths', path, operation, 'tags', i],
          });
        }
      }
    }

    return results;
  },
);

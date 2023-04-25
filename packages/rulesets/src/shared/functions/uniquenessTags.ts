import { createRulesetFunction } from '@stoplight/spectral-core';

import type { IFunctionResult } from '@stoplight/spectral-core';

type Tags = Array<{ name: string }>;

function getDuplicateTagsIndexes(tags: Tags): number[] {
  return tags
    .map(item => item.name)
    .reduce<number[]>((acc, item, i, arr) => {
      if (arr.indexOf(item) !== i) {
        acc.push(i);
      }
      return acc;
    }, []);
}

export default createRulesetFunction<Tags, null>(
  {
    input: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
        required: ['name'],
      },
    },
    options: null,
  },
  function uniquenessTags(targetVal, _, ctx) {
    const duplicatedTags = getDuplicateTagsIndexes(targetVal);
    if (duplicatedTags.length === 0) return [];

    const results: IFunctionResult[] = [];

    for (const duplicatedIndex of duplicatedTags) {
      const duplicatedTag = targetVal[duplicatedIndex].name;
      results.push({
        message: `"tags" object contains duplicate tag name "${duplicatedTag}".`,
        path: [...ctx.path, duplicatedIndex, 'name'],
      });
    }

    return results;
  },
);

import { createRulesetFunction } from '@stoplight/spectral-core';

import type { IFunctionResult } from '@stoplight/spectral-core';

type Tags = Array<{ name: string }>;

function getDuplicateTagNames(tags: Tags): string[] {
  const tagNames = tags.map(item => item.name);
  return tagNames.reduce((acc, item, idx, arr) => {
    if (arr.indexOf(item) !== idx && acc.indexOf(item) < 0) {
      acc.push(item);
    }
    return acc;
  }, [] as string[]);
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
      },
    },
    options: null,
  },
  function uniquenessTags(targetVal, _, ctx) {
    const duplicatedTags = getDuplicateTagNames(targetVal);
    if (duplicatedTags.length === 0) return [];

    const results: IFunctionResult[] = [];

    duplicatedTags.map(duplicatedTag => {
      let checkedFirst = false;
      const duplicatedTags: number[] = [];
      targetVal.forEach((tag, index) => {
        if (tag.name === duplicatedTag) {
          if (!checkedFirst) {
            checkedFirst = true;
            return;
          }
          duplicatedTags.push(index);
        }
      });

      results.push(
        ...duplicatedTags.map(duplicatedIndex => ({
          message: `"tags" object contains duplicate tag name "${duplicatedTag}".`,
          path: [...ctx.path, duplicatedIndex, 'name'],
        })),
      );
    });

    return results;
  },
);

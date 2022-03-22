import { createRulesetFunction } from '@stoplight/spectral-core';

import type { IFunctionResult } from '@stoplight/spectral-core';

function getDuplicateTagNames(tags: { name: string }[]) {
  const tagNames = tags.map(item => item.name);
  return tagNames.reduce((acc, item, idx, arr) => {
    if (arr.indexOf(item) !== idx && acc.indexOf(item) < 0) {
      acc.push(item);
    }
    return acc;
  }, [] as string[]);
}

export default createRulesetFunction<Array<{ name: string }>, null>(
  {
    input: null,
    options: null,
  },
  function asyncApi2UniquenessTags(targetVal, _, ctx) {
    if (!targetVal || targetVal.length === 0) return [];

    const duplicatedTags = getDuplicateTagNames(targetVal);
    if (!duplicatedTags || duplicatedTags.length === 0) return [];

    return [
      {
        message: `Tags contains duplicate tag names: ${duplicatedTags.join(', ')}.`,
        path: ctx.path,
      },
    ] as IFunctionResult[];
  },
);

import { createRulesetFunction } from '@stoplight/spectral-core';
import { truthy } from '@stoplight/spectral-functions';
import { mergeTraits } from './utils/mergeTraits';

import type { MaybeHaveTraits } from './utils/mergeTraits';

export default createRulesetFunction<MaybeHaveTraits, { idField: 'operationId' | 'messageId' }>(
  {
    input: {
      type: 'object',
      properties: {
        traits: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
      },
    },
    options: {
      type: 'object',
      properties: {
        idField: {
          type: 'string',
          enum: ['operationId', 'messageId'],
        },
      },
    },
  },
  function asyncApi2CheckId(targetVal, options, ctx) {
    const mergedValue = mergeTraits(targetVal);
    return truthy(mergedValue[options.idField], null, ctx);
  },
);

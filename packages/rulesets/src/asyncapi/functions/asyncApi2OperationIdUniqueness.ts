import { createRulesetFunction } from '@stoplight/spectral-core';

import { getAllOperations } from './utils/getAllOperations';

import type { IFunctionResult } from '@stoplight/spectral-core';

export default createRulesetFunction<
  { channels: Record<string, { subscribe: Record<string, unknown>; publish: Record<string, unknown> }> },
  null
>(
  {
    input: {
      type: 'object',
      properties: {
        channels: {
          type: 'object',
          properties: {
            subscribe: {
              type: 'object',
            },
            publish: {
              type: 'object',
            },
          },
        },
      },
    },
    options: null,
  },
  function asyncApi2OperationIdUniqueness(targetVal, _) {
    const results: IFunctionResult[] = [];
    const operations = getAllOperations(targetVal);

    const seenIds: unknown[] = [];
    for (const { path, operation } of operations) {
      if (!('operationId' in operation)) {
        continue;
      }

      const operationId = (operation as { operationId: string }).operationId;
      if (seenIds.includes(operationId)) {
        results.push({
          message: '"operationId" must be unique across all the operations.',
          path: [...path, 'operationId'],
        });
      } else {
        seenIds.push(operationId);
      }
    }

    return results;
  },
);

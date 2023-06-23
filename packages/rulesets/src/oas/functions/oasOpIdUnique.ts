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
  function oasOpIdUnique(paths) {
    const results: IFunctionResult[] = [];

    const seenIds: unknown[] = [];

    for (const { path, operation } of getAllOperations(paths)) {
      const pathValue = paths[path];

      if (!isObject(pathValue)) continue;

      const operationValue = pathValue[operation];

      if (!isObject(operationValue) || !('operationId' in operationValue)) {
        continue;
      }

      const { operationId } = operationValue;

      if (seenIds.includes(operationId)) {
        results.push({
          message: 'operationId must be unique.',
          path: ['paths', path, operation, 'operationId'],
        });
      } else {
        seenIds.push(operationId);
      }
    }

    return results;
  },
);

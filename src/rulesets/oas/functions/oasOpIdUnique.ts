import type { IFunction, IFunctionResult } from '../../../types';
import { getAllOperations } from './utils/getAllOperations';
import { isObject } from './utils/isObject';

export const oasOpIdUnique: IFunction = targetVal => {
  if (!isObject(targetVal) || !isObject(targetVal.paths)) return;

  const results: IFunctionResult[] = [];

  const { paths } = targetVal;

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
};

export default oasOpIdUnique;

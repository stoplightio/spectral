import type { IFunction, IFunctionResult } from '../../../types';
import { getAllOperations } from './utils/getAllOperations';

export const oasOpIdUnique: IFunction = targetVal => {
  const results: IFunctionResult[] = [];

  const { paths } = targetVal;

  const seenIds: unknown[] = [];

  for (const { path, operation } of getAllOperations(paths)) {
    if (!('operationId' in paths[path][operation])) {
      continue;
    }

    const { operationId } = paths[path][operation];

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

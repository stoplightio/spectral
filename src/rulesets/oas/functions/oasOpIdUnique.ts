import { IFunction, IFunctionResult } from '../../../types';

export const oasOpIdUnique: IFunction = (targetVal, _options, functionPaths) => {
  const results: IFunctionResult[] = [];

  const { paths = {} } = targetVal;

  const ids: any[] = [];

  for (const path in paths) {
    if (Object.keys(paths[path]).length > 0) {
      for (const operation in paths[path]) {
        if (operation !== 'parameters') {
          const { operationId } = paths[path][operation];

          if (operationId) {
            ids.push({
              path: ['paths', path, operation, 'operationId'],
              operationId,
            });
          }
        }
      }
    }
  }

  ids.forEach(operationId => {
    if (ids.filter(id => id.operationId === operationId.operationId).length > 1) {
      results.push({
        message: 'operationId must be unique',
        path: operationId.path || functionPaths.given,
      });
    }
  });

  return results;
};

export default oasOpIdUnique;

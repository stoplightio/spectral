// This function will check an API doc to verify that any tag that appears on
// an operation is also present in the global tags array.

import { IFunction, IFunctionResult } from '../../../types';

export const oasTagDefined: IFunction = targetVal => {
  const results: IFunctionResult[] = [];

  const globalTags = (targetVal.tags || []).map(({ name }: { name: string }) => name);

  const { paths = {} } = targetVal;

  const validOperationKeys = ['get', 'head', 'post', 'put', 'patch', 'delete', 'options', 'trace'];

  for (const path in paths) {
    if (Object.keys(paths[path]).length > 0) {
      for (const operation in paths[path]) {
        if (validOperationKeys.indexOf(operation) > -1) {
          const { tags = [] } = paths[path][operation];
          tags.forEach((tag: string, index: number) => {
            if (globalTags.indexOf(tag) === -1) {
              results.push({
                message: 'Operation tags should be defined in global tags.',
                path: ['paths', path, operation, 'tags', index],
              });
            }
          });
        }
      }
    }
  }

  return results;
};

export default oasTagDefined;

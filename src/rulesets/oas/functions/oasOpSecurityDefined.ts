import { JsonPath } from '@stoplight/types';

const _get = require('lodash/get');

import { IFunction, IFunctionResult } from '../../../types';

export const oasOpSecurityDefined: IFunction<{
  schemesPath: JsonPath;
}> = (targetVal, options) => {
  const results: IFunctionResult[] = [];

  const { schemesPath } = options!;

  const { paths = {} } = targetVal;
  const schemes = _get(targetVal, schemesPath) || {};
  const allDefs = Object.keys(schemes);

  for (const path in paths) {
    if (Object.keys(paths[path]).length > 0)
      for (const operation in paths[path]) {
        if (operation !== 'parameters') {
          const { security = [] } = paths[path][operation];

          for (const index in security) {
            if (security[index]) {
              const securityKeys = Object.keys(security[index]);

              if (securityKeys.length > 0 && !allDefs.includes(securityKeys[0])) {
                results.push({
                  message: 'operation referencing undefined security scheme',
                  path: ['paths', path, operation, 'security', index],
                });
              }
            }
          }
        }
      }
  }

  return results;
};

export default oasOpSecurityDefined;

import type { JsonPath } from '@stoplight/types';

import type { IFunction, IFunctionResult } from '../../../types';
import { getAllOperations } from './utils/getAllOperations';
import { isObject } from './utils/isObject';

function _get(value: unknown, path: JsonPath): unknown {
  for (const segment of path) {
    if (!isObject(value)) {
      break;
    }

    value = value[segment];
  }

  return value;
}

export const oasOpSecurityDefined: IFunction<{
  schemesPath: JsonPath;
}> = (targetVal, options) => {
  const results: IFunctionResult[] = [];

  const { schemesPath } = options;

  const { paths } = targetVal;
  const schemes = _get(targetVal, schemesPath);

  const allDefs = isObject(schemes) ? Object.keys(schemes) : [];

  for (const { path, operation } of getAllOperations(paths)) {
    const { security } = paths[path][operation];

    if (!Array.isArray(security)) {
      continue;
    }

    for (const [index, value] of security.entries()) {
      if (!isObject(value)) {
        continue;
      }

      const securityKeys = Object.keys(value);

      if (securityKeys.length > 0 && !allDefs.includes(securityKeys[0])) {
        results.push({
          message: 'Operation referencing undefined security scheme.',
          path: ['paths', path, operation, 'security', index],
        });
      }
    }
  }

  return results;
};

export default oasOpSecurityDefined;

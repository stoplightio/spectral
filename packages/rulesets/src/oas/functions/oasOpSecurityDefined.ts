import type { JsonPath } from '@stoplight/types';
import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';

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

type Options = {
  schemesPath: JsonPath;
};

export default createRulesetFunction<{ paths: Record<string, unknown> }, Options>(
  {
    input: {
      type: 'object',
      properties: {
        paths: {
          type: 'object',
        },
      },
    },
    options: {
      type: 'object',
      properties: {
        schemesPath: {
          type: 'array',
          items: {
            type: ['string', 'number'],
          },
        },
      },
    },
  },
  function oasOpSecurityDefined(targetVal, { schemesPath }) {
    const { paths } = targetVal;

    const results: IFunctionResult[] = [];

    const schemes = _get(targetVal, schemesPath);
    const allDefs = isObject(schemes) ? Object.keys(schemes) : [];

    for (const { path, operation, value } of getAllOperations(paths)) {
      if (!isObject(value)) continue;

      const { security } = value;

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
            message: 'Operation must not reference an undefined security scheme.',
            path: ['paths', path, operation, 'security', index],
          });
        }
      }
    }

    return results;
  },
);

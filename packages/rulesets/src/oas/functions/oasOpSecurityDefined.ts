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

export default createRulesetFunction<{ paths: Record<string, unknown>; security: unknown[] }, Options>(
  {
    input: {
      type: 'object',
      properties: {
        paths: {
          type: 'object',
        },
        security: {
          type: 'array',
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

    // Check global security requirements

    const { security } = targetVal;

    if (Array.isArray(security)) {
      for (const [index, value] of security.entries()) {
        if (!isObject(value)) {
          continue;
        }

        const securityKeys = Object.keys(value);

        for (const securityKey of securityKeys) {
          if (!allDefs.includes(securityKey)) {
            results.push({
              message: `API "security" values must match a scheme defined in the "${schemesPath.join('.')}" object.`,
              path: ['security', index, securityKey],
            });
          }
        }
      }
    }

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

        for (const securityKey of securityKeys) {
          if (!allDefs.includes(securityKey)) {
            results.push({
              message: `Operation "security" values must match a scheme defined in the "${schemesPath.join(
                '.',
              )}" object.`,
              path: ['paths', path, operation, 'security', index, securityKey],
            });
          }
        }
      }
    }

    return results;
  },
);

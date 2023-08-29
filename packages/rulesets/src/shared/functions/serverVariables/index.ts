import { createRulesetFunction } from '@stoplight/spectral-core';
import type { IFunctionResult } from '@stoplight/spectral-core';

import { parseUrlVariables } from './utils/parseUrlVariables';
import { getMissingProps } from '../../utils/getMissingProps';
import { getRedundantProps } from '../../utils/getRedundantProps';
import { applyUrlVariables } from './utils/applyUrlVariables';
import { JsonPath } from '@stoplight/types';

type Input = {
  url: string;
  variables?: Record<
    string,
    {
      enum: string[] | never;
      default: string | never;
      description: string | never;
      examples: string | never;
      [key: string]: unknown; // ^x-
    }
  >;
};

type Options = {
  checkSubstitutions?: boolean;
} | null;

export default createRulesetFunction<Input, Options>(
  {
    input: {
      errorMessage: 'Invalid Server Object',
      type: 'object',
      properties: {
        url: {
          type: 'string',
        },
        variables: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              enum: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              default: {
                type: 'string',
              },
              description: {
                type: 'string',
              },
              examples: {
                type: 'string',
              },
            },
            patternProperties: {
              '^x-': true,
            },
            additionalProperties: false,
          },
        },
      },
      required: ['url'],
    },
    errorOnInvalidInput: true,
    options: {
      type: ['object', 'null'],
      properties: {
        checkSubstitutions: {
          type: 'boolean',
          default: 'false',
        },
      },
      additionalProperties: false,
    },
  },
  function serverVariables({ url, variables }, opts, ctx) {
    if (variables === void 0) return;

    const results: IFunctionResult[] = [];

    const foundVariables = parseUrlVariables(url);
    const definedVariablesKeys = Object.keys(variables);

    const redundantVariables = getRedundantProps(foundVariables, definedVariablesKeys);
    for (const variable of redundantVariables) {
      results.push({
        message: `Server's "variables" object has unused defined "${variable}" url variable.`,
        path: [...ctx.path, 'variables', variable],
      });
    }

    if (foundVariables.length === 0) return results;

    const missingVariables = getMissingProps(foundVariables, definedVariablesKeys);
    if (missingVariables.length > 0) {
      results.push({
        message: `Not all server's variables are described with "variables" object. Missed: ${missingVariables.join(
          ', ',
        )}.`,
        path: [...ctx.path, 'variables'],
      });
    }

    const variablePairs: [key: string, values: string[]][] = [];

    for (const key of definedVariablesKeys) {
      if (redundantVariables.includes(key)) continue;

      const values = variables[key];

      if ('enum' in values) {
        variablePairs.push([key, values.enum]);

        if ('default' in values && !values.enum.includes(values.default)) {
          results.push({
            message: `Server Variable "${key}" has a default not listed in the enum`,
            path: [...ctx.path, 'variables', key, 'default'],
          });
        }
      } else {
        variablePairs.push([key, [values.default ?? '']]);
      }
    }

    if (opts?.checkSubstitutions === true && variablePairs.length > 0) {
      checkSubstitutions(results, ctx.path, url, variablePairs);
    }

    return results;
  },
);

function checkSubstitutions(
  results: IFunctionResult[],
  path: JsonPath,
  url: string,
  variables: [key: string, values: string[]][],
): void {
  const invalidUrls: string[] = [];

  for (const substitutedUrl of applyUrlVariables(url, variables)) {
    try {
      new URL(substitutedUrl);
    } catch {
      invalidUrls.push(substitutedUrl);
      if (invalidUrls.length === 5) {
        break;
      }
    }
  }

  if (invalidUrls.length === 5) {
    results.push({
      message: `At least 5 substitutions of server variables resulted in invalid URLs: ${invalidUrls.join(
        ', ',
      )} and more`,
      path: [...path, 'variables'],
    });
  } else if (invalidUrls.length > 0) {
    results.push({
      message: `A few substitutions of server variables resulted in invalid URLs: ${invalidUrls.join(', ')}`,
      path: [...path, 'variables'],
    });
  }
}

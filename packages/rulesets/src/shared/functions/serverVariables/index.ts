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
  requireDefault?: boolean;
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
        requireDefault: {
          type: 'boolean',
          default: 'false',
        },
      },
      additionalProperties: false,
    },
  },
  function serverVariables({ url, variables }, opts, ctx) {
    const results: IFunctionResult[] = [];

    const foundVariables = parseUrlVariables(url);
    const definedVariablesKeys = variables === void 0 ? [] : Object.keys(variables);

    accumulateRedundantVariables(results, ctx.path, foundVariables, definedVariablesKeys);

    if (foundVariables.length === 0) return results;

    accumulateMissingVariables(results, ctx.path, foundVariables, definedVariablesKeys);

    if (variables === void 0) return results;

    const variablePairs: [key: string, values: string[]][] = [];

    for (const key of definedVariablesKeys) {
      if (!foundVariables.includes(key)) continue;

      const variable = variables[key];

      if ('enum' in variable) {
        variablePairs.push([key, variable.enum]);

        checkVariableEnumValues(results, ctx.path, key, variable.enum, variable.default);
      } else if ('default' in variable) {
        variablePairs.push([key, [variable.default]]);
      } else {
        variablePairs.push([key, []]);
      }

      if (!('default' in variable) && opts?.requireDefault === true) {
        results.push({
          message: `Server Variable "${key}" has a missing default.`,
          path: [...ctx.path, 'variables', key],
        });
      }
    }

    if (opts?.checkSubstitutions === true) {
      checkSubstitutions(results, ctx.path, url, variablePairs);
    }

    return results;
  },
);

function accumulateRedundantVariables(
  results: IFunctionResult[],
  path: JsonPath,
  foundVariables: string[],
  definedVariablesKeys: string[],
): void {
  if (definedVariablesKeys.length === 0) return;

  const redundantVariables = getRedundantProps(foundVariables, definedVariablesKeys);
  for (const variable of redundantVariables) {
    results.push({
      message: `Server's "variables" object has unused defined "${variable}" url variable.`,
      path: [...path, 'variables', variable],
    });
  }
}

function accumulateMissingVariables(
  results: IFunctionResult[],
  path: JsonPath,
  foundVariables: string[],
  definedVariablesKeys: string[],
): void {
  const missingVariables =
    definedVariablesKeys.length === 0 ? foundVariables : getMissingProps(foundVariables, definedVariablesKeys);

  if (missingVariables.length > 0) {
    results.push({
      message: `Not all server's variables are described with "variables" object. Missed: ${missingVariables.join(
        ', ',
      )}.`,
      path: [...path, 'variables'],
    });
  }
}

function checkVariableEnumValues(
  results: IFunctionResult[],
  path: JsonPath,
  name: string,
  enumValues: string[],
  defaultValue: string | undefined,
): void {
  if (defaultValue !== void 0 && !enumValues.includes(defaultValue)) {
    results.push({
      message: `Server Variable "${name}" has a default not listed in the enum.`,
      path: [...path, 'variables', name, 'default'],
    });
  }
}

function checkSubstitutions(
  results: IFunctionResult[],
  path: JsonPath,
  url: string,
  variables: [key: string, values: string[]][],
): void {
  if (variables.length === 0) return;

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

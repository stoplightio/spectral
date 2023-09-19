import { createRulesetFunction } from '@stoplight/spectral-core';
import type { IFunctionResult } from '@stoplight/spectral-core';
import { isPlainObject } from '@stoplight/json';

type Options = {
  oasVersion: 2 | 3;
};

export default createRulesetFunction<Record<string, string[]>, Options>(
  {
    input: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    options: {
      type: 'object',
      properties: {
        oasVersion: {
          enum: [2, 3],
        },
      },
      additionalProperties: false,
    },
  },
  function oasSecurityDefined(input, { oasVersion }, { document, path }) {
    const schemeNames = Object.keys(input);
    if (schemeNames.length === 0) return;

    if (!isPlainObject(document.data)) return;

    const allDefs =
      oasVersion === 2
        ? document.data.securityDefinitions
        : isPlainObject(document.data.components)
        ? document.data.components.securitySchemes
        : null;

    let results: IFunctionResult[] | undefined;

    for (const schemeName of schemeNames) {
      if (!isPlainObject(allDefs) || !(schemeName in allDefs)) {
        const object = path.length == 2 ? 'API' : 'Operation';
        const location = oasVersion === 2 ? 'securityDefinitions' : 'components.securitySchemes';
        results ??= [];
        results.push({
          message: `${object} "security" values must match a scheme defined in the "${location}" object.`,
          path: [...path, schemeName],
        });

        continue;
      }

      const scope = input[schemeName];
      for (let i = 0; i < scope.length; i++) {
        const scopeName = scope[i];
        if (!isScopeDefined(oasVersion, scopeName, allDefs[schemeName])) {
          results ??= [];
          results.push({
            message: `"${scopeName}" must be listed among scopes.`,
            path: [...path, schemeName, i],
          });
        }
      }
    }

    return results;
  },
);

function isScopeDefined(oasVersion: 2 | 3, scopeName: string, securityScheme: unknown): boolean {
  if (!isPlainObject(securityScheme)) return false;

  if (oasVersion === 2) {
    return isPlainObject(securityScheme.scopes) && scopeName in securityScheme.scopes;
  }

  if (isPlainObject(securityScheme.flows)) {
    for (const flow of Object.values(securityScheme.flows)) {
      if (isPlainObject(flow) && isPlainObject(flow.scopes) && scopeName in flow.scopes) {
        return true;
      }
    }
  }

  return false;
}

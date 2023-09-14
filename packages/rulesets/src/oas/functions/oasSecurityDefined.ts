import { createRulesetFunction } from '@stoplight/spectral-core';
import type { IFunctionResult } from '@stoplight/spectral-core';
import { isPlainObject } from '@stoplight/json';

type Options = {
  oasVersion: 2 | 3;
};

export default createRulesetFunction<Record<string, unknown>[], Options>(
  {
    input: {
      type: 'object',
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
        const scope = path.length == 2 ? 'API' : 'Operation';
        const location = oasVersion === 2 ? 'securityDefinitions' : 'components.securitySchemes';
        results ??= [];
        results.push({
          message: `${scope} "security" values must match a scheme defined in the "${location}" object.`,
          path: [...path, schemeName],
        });
      }
    }

    return results;
  },
);

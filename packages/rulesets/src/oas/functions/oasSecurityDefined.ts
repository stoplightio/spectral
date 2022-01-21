import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import { oas2 } from '@stoplight/spectral-formats';
import { isPlainObject } from '@stoplight/json';

export default createRulesetFunction<unknown[], null>(
  {
    input: {
      type: 'array',
    },
    options: null,
  },
  function oasOpSecurityDefined(targetVal, _options, ctx) {
    if (!ctx.document.formats || !isPlainObject(ctx.document.data)) return;

    const results: IFunctionResult[] = [];

    const isOAS2 = ctx.document.formats?.has(oas2);
    const schemes: unknown = isOAS2
      ? ctx.document.data.securityDefinitions
      : isPlainObject(ctx.document.data.components)
      ? ctx.document.data.components.securitySchemes
      : null;

    const allDefs = isPlainObject(schemes) ? Object.keys(schemes) : [];

    for (const [index, value] of targetVal.entries()) {
      if (!isPlainObject(value)) {
        continue;
      }

      const securityKeys = Object.keys(value);

      if (securityKeys.length > 0 && !allDefs.includes(securityKeys[0])) {
        results.push({
          message: 'Must not reference an undefined security scheme.',
          path: [...ctx.path, index],
        });
      }
    }

    return results;
  },
);

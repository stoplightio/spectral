import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';

import { isObject } from './utils/isObject';
import { oas2 } from '@stoplight/spectral-formats';
import { get as _get } from 'lodash';

export default createRulesetFunction<unknown[], null>(
  {
    input: {
      type: 'array',
    },
    options: null,
  },
  function oasOpSecurityDefined(targetVal, _options, ctx) {
    const results: IFunctionResult[] = [];

    if (!ctx.document.formats) return results;

    const isOAS2 = ctx.document.formats?.has(oas2);
    const schemes: unknown = _get(ctx.document.data, isOAS2 ? 'securityDefinitions' : 'components.securitySchemes');

    const allDefs = isObject(schemes) ? Object.keys(schemes) : [];

    for (const [index, value] of targetVal.entries()) {
      if (!isObject(value)) {
        continue;
      }

      const securityKeys = Object.keys(value);

      if (securityKeys.length > 0 && !allDefs.includes(securityKeys[0])) {
        results.push({
          message: 'Operation must not reference an undefined security scheme.',
          path: [...ctx.path, index],
        });
      }
    }

    return results;
  },
);

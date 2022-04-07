import { createRulesetFunction } from '@stoplight/spectral-core';

import { parseUrlVariables } from './utils/parseUrlVariables';
import { getMissingProps } from './utils/getMissingProps';
import { getRedundantProps } from './utils/getRedundantProps';

import type { IFunctionResult } from '@stoplight/spectral-core';

export default createRulesetFunction<{ url: string; variables: Record<string, unknown> }, null>(
  {
    input: null,
    options: null,
  },
  function asyncApi2ServerVariables(targetVal, _, ctx) {
    const results: IFunctionResult[] = [];

    const variables = parseUrlVariables(targetVal.url);
    if (variables.length === 0) return results;

    const missingVariables = getMissingProps(variables, targetVal.variables);
    if (missingVariables.length) {
      results.push({
        message: `Not all server's variables are described with "variables" object. Missed: ${missingVariables.join(
          ', ',
        )}.`,
        path: [...ctx.path, 'variables'],
      });
    }

    const redundantVariables = getRedundantProps(variables, targetVal.variables);
    if (redundantVariables.length) {
      redundantVariables.forEach(variable => {
        results.push({
          message: `Server's "variables" object has redundant defined "${variable}" url variable.`,
          path: [...ctx.path, 'variables', variable],
        });
      });
    }

    return results;
  },
);

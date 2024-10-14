import { createRulesetFunction } from '@stoplight/spectral-core';

import type { IFunctionResult } from '@stoplight/spectral-core';
import { parseUrlVariables } from '../../shared/functions/serverVariables/utils/parseUrlVariables';
import { getMissingProps } from '../../shared/utils/getMissingProps';
import { getRedundantProps } from '../../shared/utils/getRedundantProps';

export default createRulesetFunction<{ address?: string; parameters: Record<string, unknown> }, null>(
  {
    input: {
      type: 'object',
      properties: {
        parameters: {
          type: 'object',
        },
      },
      required: ['parameters'],
    },
    options: null,
  },
  function asyncApiChannelParameters(targetVal, _, ctx) {
    let path = ctx.path[ctx.path.length - 1] as string;
    const results: IFunctionResult[] = [];
    // If v3 using address, use that.
    if (targetVal.address !== null && targetVal.address !== undefined) {
      path = targetVal.address;
    }
    // Ignore v3 reply channels with no address, id of v3 contain no variable substitutions.
    const parameters = parseUrlVariables(path);
    if (parameters.length === 0) return;

    const missingParameters = getMissingProps(parameters, Object.keys(targetVal.parameters));
    if (missingParameters.length) {
      results.push({
        message: `Not all channel's parameters are described with "parameters" object. Missed: ${missingParameters.join(
          ', ',
        )}.`,
        path: [...ctx.path, 'parameters'],
      });
    }

    const redundantParameters = getRedundantProps(parameters, Object.keys(targetVal.parameters));
    if (redundantParameters.length) {
      redundantParameters.forEach(param => {
        results.push({
          message: `Channel's "parameters" object has redundant defined "${param}" parameter.`,
          path: [...ctx.path, 'parameters', param],
        });
      });
    }

    return results;
  },
);

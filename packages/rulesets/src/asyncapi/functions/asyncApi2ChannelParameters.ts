import { createRulesetFunction } from '@stoplight/spectral-core';

import type { IFunctionResult } from '@stoplight/spectral-core';
import { parseUrlVariables } from '../../shared/functions/serverVariables/utils/parseUrlVariables';
import { getMissingProps } from '../../shared/utils/getMissingProps';
import { getRedundantProps } from '../../shared/utils/getRedundantProps';

export default createRulesetFunction<{ parameters: Record<string, unknown> }, null>(
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
  function asyncApi2ChannelParameters(targetVal, _, ctx) {
    const path = ctx.path[ctx.path.length - 1] as string;
    const results: IFunctionResult[] = [];

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

import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import { printValue } from '@stoplight/spectral-runtime';

import { optionSchemas } from './optionSchemas';

export type Options = {
  /** test to verify if one (but not all) of the provided keys are present in object */
  properties: string[];
};

export default createRulesetFunction<Record<string, unknown>, Options>(
  {
    input: {
      type: 'object',
    },
    options: optionSchemas.xor,
  },
  function xor(targetVal, { properties }) {
    const results: IFunctionResult[] = [];

    const intersection = Object.keys(targetVal).filter(key => properties.includes(key));

    if (intersection.length !== 1) {
      const formattedProperties = properties.map(prop => printValue(prop));

      const lastProperty = formattedProperties.pop();
      let message = formattedProperties.join(', ') + (lastProperty != undefined ? ` and ${lastProperty}` : '');

      message += ' must not be both defined or both undefined';

      results.push({
        message,
      });
    }

    return results;
  },
);

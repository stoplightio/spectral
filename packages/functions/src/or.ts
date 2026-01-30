import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import { optionSchemas } from './optionSchemas';

export type Options = {
  /** test to verify at least one of the provided keys are present in object */
  properties: string[];
};

export default createRulesetFunction<Record<string, unknown>, Options>(
  {
    input: {
      type: 'object',
    },
    options: optionSchemas.or,
  },
  function or(targetVal, { properties }) {
    if (properties.length < 2) return;
    // At least two but no maximum limit on number of properties

    const results: IFunctionResult[] = [];

    const intersection = Object.keys(targetVal).filter(value => -1 !== properties.indexOf(value));
    if (intersection.length == 0) {
      if (properties.length > 4) {
        // List first three properties and remaining count in error message
        const shortprops = properties.slice(0, 3);
        const count = String(properties.length - 3) + ' other properties must be defined';
        results.push({
          message: 'At least one of "' + shortprops.join('" or "') + '" or ' + count,
        });
      } else {
        // List all of two to four properties directly in error message
        results.push({
          message: 'At least one of "' + properties.join('" or "') + '" must be defined',
        });
      }
    }

    return results;
  },
);

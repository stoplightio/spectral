import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import { optionSchemas } from './optionSchemas';

export type Options = {
  /** test to verify if one (but not all) of the provided keys are present in object */
  properties: string[];
  exclusive: boolean;
};

export default createRulesetFunction<Record<string, unknown>, Options>(
  {
    input: {
      type: 'object',
    },
    options: optionSchemas.xor,
  },
  function xor(targetVal, opts: Options) {
    const properties = opts.properties;
    if (properties.length == 0) return;
    // There need be no maximum limit on number of properties

    const results: IFunctionResult[] = [];

    const intersection = Object.keys(targetVal).filter(value => -1 !== properties.indexOf(value));
    const exclusive = (opts.exclusive == null) || opts.exclusive;
    const exactlyOrAtLeast = exclusive ? "Exactly" : "At least";

    // One-must-be-defined validation of both xor and or (non-exclusive) functions
    if (intersection.length == 0) {
      if (properties.length > 4) {
        // List first three properties and remaining count in error message
        const shortprops = properties.slice(0, 3);
        const count = String(properties.length - 3) + ' other properties must be defined';
        results.push({
          message: exactlyOrAtLeast + ' one of "' + shortprops.join('" or "') + '" or ' + count,
        });
      } else {
        // List all of one to four properties directly in error message
        results.push({
          message: exactlyOrAtLeast + ' one of "' + properties.join('" or "') + '" must be defined',
        });
      }
    }

    // Maximum-one-defined validation of xor function only
    if (exclusive && intersection.length > 1) {
      // List all defined properties in error message
      results.push({
        message: 'Just one of "' + intersection.join('" and "') + '" must be defined',
      });
    }

    return results;
  },
);

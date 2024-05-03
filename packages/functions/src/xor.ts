import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
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
<<<<<<< HEAD
    if (properties.length == 0) return;
    // There need be no maximum limit on number of properties

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
        // List all of one to four properties directly in error message
        results.push({
          message: 'At least one of "' + properties.join('" or "') + '" must be defined',
        });
      }
    }

    if (intersection.length > 1) {
      // List all defined properties in error message
      results.push({
        message: 'Just one of "' + intersection.join('" and "') + '" must be defined',
=======
    const results: IFunctionResult[] = [];

    const intersection = Object.keys(targetVal).filter(key => properties.includes(key));

    if (intersection.length !== 1) {
      const formattedProperties = properties.map(prop => printValue(prop));

      const lastProperty = formattedProperties.pop();
      let message = formattedProperties.join(', ') + (lastProperty != undefined ? ` and ${lastProperty}` : '');

      message += ' must not be both defined or both undefined';

      results.push({
        message,
>>>>>>> af9c742e (feat(rulesets): add multiple xor (#2614))
      });
    }

    return results;
  },
);

import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import { printValue } from '@stoplight/spectral-runtime';

export type Options = {
  /** test to verify if one (but not all) of the provided keys are present in object */
  properties: string[];
};

export default createRulesetFunction<Record<string, unknown>, Options>(
  {
    input: {
      type: 'object',
    },
    options: {
      type: 'object',
      properties: {
        properties: {
          type: 'array',
          items: {
            type: 'string',
          },
          minItems: 2,
          maxItems: 2,
          errorMessage: `"xor" and its "properties" option support 2-item tuples, i.e. ["id", "name"]`,
        },
      },
      additionalProperties: false,
      required: ['properties'],
      errorMessage: {
        type: `"xor" function has invalid options specified. Example valid options: { "properties": ["id", "name"] }, { "properties": ["country", "street"] }`,
      },
    },
  },
  function xor(targetVal, { properties }) {
    if (properties.length !== 2) return;

    const results: IFunctionResult[] = [];

    const intersection = Object.keys(targetVal).filter(value => -1 !== properties.indexOf(value));
    if (intersection.length !== 1) {
      results.push({
        message: `${printValue(properties[0])} and ${printValue(
          properties[1],
        )} must not be both defined or both undefined`,
      });
    }

    return results;
  },
);

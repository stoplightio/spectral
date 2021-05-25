import { createRulesetFunction } from '@stoplight/spectral-core';
import { printValue } from '@stoplight/spectral-utils';

type Primitive = string | number | null | boolean;

export type Options = {
  values: Primitive[];
};

export default createRulesetFunction<Primitive, Options>(
  {
    input: {
      type: ['string', 'number', 'null', 'boolean'],
    },
    options: {
      type: 'object',
      additionalProperties: false,
      properties: {
        values: {
          type: 'array',
          items: {
            type: ['string', 'number', 'null', 'boolean'],
          },
          errorMessage:
            '"enumeration" and its "values" option support only arrays of primitive values, i.e. ["Berlin", "London", "Paris"]',
        },
      },
      required: ['values'],
      errorMessage: {
        type: `"enumeration" function has invalid options specified. Example valid options: { "values": ["Berlin", "London", "Paris"] }, { "values": [2, 3, 5, 8, 13, 21] }`,
      },
    },
  },
  function enumeration(targetVal, { values }) {
    if (!values.includes(targetVal)) {
      return [
        {
          message: `#{{print("value")}} must be equal to one of the allowed values: ${values
            .map(printValue)
            .join(', ')}`,
        },
      ];
    }

    return;
  },
);

import { createRulesetFunction } from '@stoplight/spectral-core';
import { printValue } from '@stoplight/spectral-runtime';

import { optionSchemas } from './schema/optionSchemas';

type Primitive = string | number | null | boolean;

export type Options = {
  values: Primitive[];
};

export default createRulesetFunction<Primitive, Options>(
  {
    input: {
      type: ['string', 'number', 'null', 'boolean'],
    },
    options: optionSchemas.enumeration,
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

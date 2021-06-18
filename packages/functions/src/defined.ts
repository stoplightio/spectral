import { createRulesetFunction } from '@stoplight/spectral-core';

export default createRulesetFunction<unknown, null>(
  {
    input: null,
    options: null,
  },
  function defined(input) {
    if (typeof input === 'undefined') {
      return [
        {
          message: '#{{print("property")}}must be defined',
        },
      ];
    }

    return;
  },
);

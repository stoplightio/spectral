import { createRulesetFunction } from '@stoplight/spectral-core';

export default createRulesetFunction<unknown, null>(
  {
    input: null,
    options: null,
  },
  function truthy(input) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!input) {
      return [
        {
          message: '#{{print("property")}}must be truthy',
        },
      ];
    }

    return;
  },
);

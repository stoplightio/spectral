import { createRulesetFunction } from '@stoplight/spectral-core';

export default createRulesetFunction<unknown, null>(
  {
    input: null,
    options: null,
  },
  function falsy(input) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (input) {
      return [
        {
          message: '#{{print("property")}}must be falsy',
        },
      ];
    }

    return;
  },
);

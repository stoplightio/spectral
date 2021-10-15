import { createRulesetFunction } from '@stoplight/spectral-core';

import { optionSchemas } from './schema/optionSchemas';

export default createRulesetFunction<unknown, null>(
  {
    input: null,
    options: optionSchemas.falsy,
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

import { createRulesetFunction } from '@stoplight/spectral-core';

import { optionSchemas } from './optionSchemas';

export default createRulesetFunction(
  {
    input: null,
    options: optionSchemas.undefined,
  },

  function undefined(targetVal) {
    if (typeof targetVal !== 'undefined') {
      return [
        {
          message: '#{{print("property")}}must be undefined',
        },
      ];
    }

    return;
  },
);

import { createRulesetFunction } from '@stoplight/spectral-core';

import { optionSchemas } from './optionSchemas';

export default createRulesetFunction(
  {
    input: null,
    options: optionSchemas.undefined,
  },
  // eslint-disable-next-line no-shadow-restricted-names
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

import { createRulesetFunction } from '@stoplight/spectral-core';

export default createRulesetFunction(
  {
    input: null,
    options: {
      type: 'null',
    },
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

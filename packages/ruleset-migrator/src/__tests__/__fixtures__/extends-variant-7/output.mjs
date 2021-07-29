import { oas2, oas3, oas3_1, oas3_0 } from '@stoplight/spectral-formats';
import pascalCase from '/.tmp/spectral/extends-variant-7/functions/pascalCase.js';
import pascalCase$0 from '/.tmp/spectral/extends-variant-7/assets/functions/pascalCase.js';
import oas3$0 from '/.tmp/spectral/extends-variant-7/assets/functions/oas3.js';
import { truthy } from '@stoplight/spectral-functions';
import pascalCase$1 from '/.tmp/spectral/extends-variant-7/assets/fns/pascalCase.js';
export default {
  formats: [oas2, oas3],
  extends: [
    {
      formats: [oas2, oas3_1],
      rules: {
        'my-rule': {
          given: '$',
          then: {
            function: truthy,
          },
        },
      },
    },
    {
      formats: [oas3_0],
      rules: {
        'my-rule': {
          given: '$',
          then: {
            function: pascalCase$0,
          },
        },
      },
    },
    {
      rules: {
        'my-rule': {
          given: '$',
          then: {
            function: pascalCase$1,
          },
        },
      },
    },
  ],
  rules: {
    'my-rule': {
      given: '$',
      then: {
        function: pascalCase,
      },
    },
  },
};

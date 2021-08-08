import { oas3, oas3_1 } from '@stoplight/spectral-formats';
import oas3$0 from '/.tmp/spectral/functions-variant-4/functions/oas3.js';
export default {
  formats: [oas3, oas3_1],
  rules: {
    rule: {
      given: '$',
      then: [
        {
          function: oas3$0,
        },
      ],
    },
  },
};

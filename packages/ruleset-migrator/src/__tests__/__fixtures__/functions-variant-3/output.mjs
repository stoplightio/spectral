import uppercase from '/.tmp/spectral/functions-variant-3/functions/upper-case.js';
import no from '/.tmp/spectral/functions-variant-3/functions/no-@.js';
import _400response from '/.tmp/spectral/functions-variant-3/functions/400-response.js';
import import$0 from '/.tmp/spectral/functions-variant-3/functions/import.js';
import require$0 from '/.tmp/spectral/functions-variant-3/functions/require.js';
export default {
  rules: {
    rule: {
      given: '$',
      then: [
        {
          function: uppercase,
        },
        {
          function: no,
        },
        {
          function: _400response,
        },
        {
          function: import$0,
        },
        {
          function: require$0,
        },
      ],
    },
  },
};

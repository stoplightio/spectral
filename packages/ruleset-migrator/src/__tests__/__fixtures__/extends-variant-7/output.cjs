const { oas2, oas3, oas3_0, oas3_1 } = require('@stoplight/spectral-formats');
const { truthy } = require('@stoplight/spectral-functions');
const pascalCase$1 = _interopDefault(require('/.tmp/spectral/extends-variant-7/assets/fns/pascalCase.js'));
const oas3$0 = _interopDefault(require('/.tmp/spectral/extends-variant-7/assets/functions/oas3.js'));
const pascalCase$0 = _interopDefault(require('/.tmp/spectral/extends-variant-7/assets/functions/pascalCase.js'));
const pascalCase = _interopDefault(require('/.tmp/spectral/extends-variant-7/functions/pascalCase.js'));
module.exports = {
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
function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

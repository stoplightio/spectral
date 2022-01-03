const { oas3: oas3$0, oas3_1 } = require('@stoplight/spectral-formats');
const oas3 = _interopDefault(require('/.tmp/spectral/functions-variant-4/functions/oas3.js'));
module.exports = {
  formats: [oas3$0, oas3_1],
  rules: {
    rule: {
      given: '$',
      then: [
        {
          function: oas3,
        },
      ],
    },
  },
};
function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

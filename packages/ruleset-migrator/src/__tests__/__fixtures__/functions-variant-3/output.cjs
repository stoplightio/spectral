const _400response = _interopDefault(require('/.tmp/spectral/functions-variant-3/functions/400-response.js'));
const import$0 = _interopDefault(require('/.tmp/spectral/functions-variant-3/functions/import.js'));
const no = _interopDefault(require('/.tmp/spectral/functions-variant-3/functions/no-@.js'));
const require$0 = _interopDefault(require('/.tmp/spectral/functions-variant-3/functions/require.js'));
const uppercase = _interopDefault(require('/.tmp/spectral/functions-variant-3/functions/upper-case.js'));
module.exports = {
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
function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

const donothing = _interopDefault(require('/.tmp/spectral/functions-variant-5/custom-functions/do-nothing.js'));
module.exports = {
  rules: {
    rule: {
      given: '$',
      then: {
        function: donothing,
      },
    },
  },
};
function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

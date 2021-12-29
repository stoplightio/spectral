const ruleset_cjs = _interopDefault(require('/.tmp/spectral/extends-variant-6/assets/ruleset.cjs'));
const ruleset_js = _interopDefault(require('/.tmp/spectral/extends-variant-6/assets/ruleset.js'));
const ruleset_mjs = _interopDefault(require('/.tmp/spectral/extends-variant-6/assets/ruleset.mjs'));
module.exports = {
  extends: [ruleset_js, ruleset_cjs, ruleset_mjs],
};
function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

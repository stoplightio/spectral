const oasDocumentSchema = _interopDefault(require('/.tmp/spectral/functions-variant-2/custom-functions/oasDocumentSchema.js'));
const oasExample = _interopDefault(require('/.tmp/spectral/functions-variant-2/custom-functions/oasExample.js'));
const oasOp2xxResponse = _interopDefault(require('/.tmp/spectral/functions-variant-2/custom-functions/oasOp2xxResponse.js'));
module.exports = {
  documentationUrl: 'https://meta.stoplight.io/docs/spectral/docs/reference/openapi-rules.md',
  rules: {
    'operation-2xx-response': {
      description: 'Operation must have at least one `2xx` response.',
      recommended: true,
      type: 'style',
      given:
        "$.paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' || @property === 'delete' || @property === 'options' || @property === 'head' || @property === 'patch' || @property === 'trace' )]",
      then: {
        field: 'responses',
        function: oasOp2xxResponse,
      },
    },
  },
};
function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

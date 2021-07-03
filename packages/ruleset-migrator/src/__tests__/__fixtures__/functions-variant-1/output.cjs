const { oas2: oas2, oas3: oas3 } = require('@stoplight/spectral-formats');
const oasDocumentSchema = _interopDefault(require('/.tmp/spectral/functions-variant-1/functions/oasDocumentSchema.js'));
const oasExample = _interopDefault(require('/.tmp/spectral/functions-variant-1/functions/oasExample.js'));
const oasOp2xxResponse = _interopDefault(require('/.tmp/spectral/functions-variant-1/functions/oasOp2xxResponse.js'));
const oasOpFormDataConsumeCheck = _interopDefault(require('/.tmp/spectral/functions-variant-1/functions/oasOpFormDataConsumeCheck.js'));
const typedEnum = _interopDefault(require('/.tmp/spectral/functions-variant-1/functions/typedEnum.js'));
const refSiblings = _interopDefault(require('/.tmp/spectral/functions-variant-1/functions/refSiblings.js'));
module.exports = {
  documentationUrl: 'https://meta.stoplight.io/docs/spectral/docs/reference/openapi-rules.md',
  formats: [oas2, oas3],
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

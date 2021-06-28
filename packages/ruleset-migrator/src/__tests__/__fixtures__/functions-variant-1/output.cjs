const { oas2: oas2, oas3: oas3 } = require('@stoplight/spectral-formats');
const oasDocumentSchema = _interopDefault(require('./functions/oasDocumentSchema.js'));
const oasExample = _interopDefault(require('./functions/oasExample.js'));
const oasOp2xxResponse = _interopDefault(require('./functions/oasOp2xxResponse.js'));
const oasOpFormDataConsumeCheck = _interopDefault(require('./functions/oasOpFormDataConsumeCheck.js'));
const typedEnum = _interopDefault(require('./functions/typedEnum.js'));
const refSiblings = _interopDefault(require('./functions/refSiblings.js'));
module.exports = {
  documentationUrl: 'https://meta.stoplight.io/docs/spectral/docs/reference/openapi-rules.md',
  formats: [oas2, oas3],
  functions: [oasDocumentSchema, oasExample, oasOp2xxResponse, oasOpFormDataConsumeCheck, typedEnum, refSiblings],
  rules: {
    'operation-default-response': {
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

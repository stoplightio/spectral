import { oas2, oas3 } from '@stoplight/spectral-formats';
import oasDocumentSchema from '/.tmp/spectral/functions-variant-1/functions/oasDocumentSchema.js';
import oasExample from '/.tmp/spectral/functions-variant-1/functions/oasExample.js';
import oasOp2xxResponse from '/.tmp/spectral/functions-variant-1/functions/oasOp2xxResponse.js';
import oasOpFormDataConsumeCheck from '/.tmp/spectral/functions-variant-1/functions/oasOpFormDataConsumeCheck.js';
import typedEnum from '/.tmp/spectral/functions-variant-1/functions/typedEnum.js';
import refSiblings from '/.tmp/spectral/functions-variant-1/functions/refSiblings.js';
export default {
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

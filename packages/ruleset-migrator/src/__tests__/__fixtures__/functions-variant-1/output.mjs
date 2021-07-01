import { oas2, oas3 } from '@stoplight/spectral-formats';
import oasDocumentSchema from './functions/oasDocumentSchema.js';
import oasExample from './functions/oasExample.js';
import oasOp2xxResponse from './functions/oasOp2xxResponse.js';
import oasOpFormDataConsumeCheck from './functions/oasOpFormDataConsumeCheck.js';
import typedEnum from './functions/typedEnum.js';
import refSiblings from './functions/refSiblings.js';
export default {
  documentationUrl: 'https://meta.stoplight.io/docs/spectral/docs/reference/openapi-rules.md',
  formats: [oas2, oas3],
  functions: [oasDocumentSchema, oasExample, oasOp2xxResponse, oasOpFormDataConsumeCheck, typedEnum, refSiblings],
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

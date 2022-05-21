import { asyncapi2, jsonSchemaLoose, oas2, oas3, oas3_0, oas3_1 } from '@stoplight/spectral-formats';
import { truthy } from '@stoplight/spectral-functions';
export default {
  formats: [oas2, oas3_1, oas3_0, jsonSchemaLoose],
  rules: {
    test: {
      given: '$',
      formats: [asyncapi2, oas3, oas3_0, oas3_1],
      then: {
        function: truthy,
      },
    },
  },
};

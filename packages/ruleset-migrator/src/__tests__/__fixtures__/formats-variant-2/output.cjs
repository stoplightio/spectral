const { asyncapi2, jsonSchemaLoose, oas2, oas3, oas3_0, oas3_1 } = require('@stoplight/spectral-formats');
const { truthy } = require('@stoplight/spectral-functions');
module.exports = {
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

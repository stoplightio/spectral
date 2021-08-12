const {
  oas2: oas2,
  oas3_1: oas3_1,
  oas3_0: oas3_0,
  jsonSchemaLoose: jsonSchemaLoose,
  asyncapi2: asyncapi2,
  oas3: oas3,
} = require('@stoplight/spectral-formats');
const { truthy: truthy } = require('@stoplight/spectral-functions');
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

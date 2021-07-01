const {
  oas2: oas2,
  oas3_1: oas3_1,
  oas3_0: oas3_0,
  jsonSchemaLoose: jsonSchemaLoose,
} = require('@stoplight/spectral-formats');
module.exports = {
  formats: [oas2, oas3_1, oas3_0, jsonSchemaLoose],
  rules: {},
};

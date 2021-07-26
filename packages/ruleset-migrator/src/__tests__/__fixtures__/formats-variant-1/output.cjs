const {
  oas2: oas2,
  oas3_1: oas3_1,
  oas3_0: oas3_0,
  jsonSchemaLoose: jsonSchemaLoose,
  jsonSchemaDraft2019_09: jsonSchemaDraft2019_09,
} = require('@stoplight/spectral-formats');
module.exports = {
  formats: [oas2, oas3_1, oas3_0, jsonSchemaLoose, jsonSchemaDraft2019_09],
  rules: {},
};

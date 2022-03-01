const { jsonSchemaDraft2019_09, jsonSchemaLoose, oas2, oas3_0, oas3_1 } = require('@stoplight/spectral-formats');
module.exports = {
  formats: [oas2, oas3_1, oas3_0, jsonSchemaLoose, jsonSchemaDraft2019_09],
  rules: {},
};

const {
  jsonSchemaDraft2019_09: jsonSchemaDraft2019_09,
  jsonSchemaDraft2020_12: jsonSchemaDraft2020_12,
} = require('@stoplight/spectral-formats');
const { truthy: truthy } = require('@stoplight/spectral-functions');
module.exports = {
  formats: [jsonSchemaDraft2019_09, jsonSchemaDraft2020_12],
  rules: {
    test: {
      given: '$',
      then: {
        function: truthy,
      },
    },
  },
};

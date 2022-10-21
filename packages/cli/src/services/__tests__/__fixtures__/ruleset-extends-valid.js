const rulesetValid = require('./ruleset-valid');
const { pattern } = require('@stoplight/spectral-functions');

module.exports = {
  extends: rulesetValid,
  rules: {
    'no-swagger': {
      message: 'Use OpenAPI instead ;)',
      given: '$..*',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: 'Swagger',
        },
      },
    },
  },
};

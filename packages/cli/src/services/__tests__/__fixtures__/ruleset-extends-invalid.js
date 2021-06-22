const rulesetInvalid = require('./ruleset-invalid');
const { pattern } = require('@stoplight/spectral-functions');

module.exports = {
  extends: rulesetInvalid,
  rules: {
    'no-swagger': {
      message: 'Use OpenAPI instead ;)',
      given: '$..*',
      type: 'style',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: 'Swagger',
        }
      }
    }
  }
}

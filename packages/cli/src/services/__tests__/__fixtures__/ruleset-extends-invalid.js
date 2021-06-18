const rulesetInvalid = require('./ruleset-invalid');
const { default: pattern } = require('../../../../../dist/functions/pattern');

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

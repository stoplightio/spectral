const rulesetValid = require('./ruleset-valid');
const { default: pattern } = require('../../../../../dist/functions/pattern');

module.exports = {
  extends: rulesetValid,
  rules: {
    'no-swagger': {
      message: 'Use OpenAPI instead ;)',
      given: '$..*',
      type: 'style',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: 'Swagger',
        },
      },
    },
  },
};

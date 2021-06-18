const { oas } = require('@stoplight/spectral-rulesets');

module.exports = {
  extends: [[oas, 'off']],
  rules: {
    'oas3-parameter-description': true,
  },
};

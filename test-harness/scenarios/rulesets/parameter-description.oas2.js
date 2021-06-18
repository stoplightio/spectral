const { oas } = require('@stoplight/spectral-rulesets');

module.exports = {
  extends: [[oas, 'off']],
  rules: {
    'oas2-parameter-description': true,
  },
};

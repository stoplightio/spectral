const { oas } = require('@stoplight/spectral-rulesets');
module.exports = {
  extends: oas,
  overrides: [
    {
      files: ['**#/info'],
      rules: {
        'info-contact': 'off',
        'info-description': 'off',
      },
    },
  ],
};

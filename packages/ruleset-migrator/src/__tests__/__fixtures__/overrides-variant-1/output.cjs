const { oas } = require('@stoplight/spectral-rulesets');
const { oas2, oas3 } = require('@stoplight/spectral-formats');
module.exports = {
  overrides: [
    {
      files: ["apis/*.json"],
      extends: oas,
      formats: [oas2, oas3],
    },
  ],
};

const { asyncapi, oas } = require('@stoplight/spectral-rulesets');
module.exports = {
  extends: [oas, asyncapi],
};

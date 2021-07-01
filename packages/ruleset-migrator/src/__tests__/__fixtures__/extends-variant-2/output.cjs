const { oas: oas, asyncapi: asyncapi } = require('@stoplight/spectral-rulesets');
module.exports = {
  extends: [oas, asyncapi],
};

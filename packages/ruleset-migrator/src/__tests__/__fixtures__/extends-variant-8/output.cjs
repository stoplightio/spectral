const { truthy: truthy, falsy: falsy } = require('@stoplight/spectral-functions');
const pascalCase = _interopDefault(require('/.tmp/spectral/extends-variant-8/assets/shared/functions/pascalCase.js'));
module.exports = {
  extends: [
    {
      extends: [
        {
          rules: {
            "my-rule": {
              message: "ruleset 2",
              given: "$",
              then: {
                function: falsy,
              },
            },
          },
        },
        {
          rules: {
            "my-rule": {
              message: "ruleset 3",
              given: "$",
              then: {
                function: pascalCase,
              },
            },
          },
        },
      ],
      rules: {
        "my-rule": {
          message: "ruleset",
          given: "$",
          then: {
            function: truthy,
          },
        },
      },
    },
  ],
};
function _interopDefault(ex) {
  return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
}

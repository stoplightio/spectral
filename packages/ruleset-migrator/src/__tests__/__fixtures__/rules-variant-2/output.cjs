const { truthy: truthy } = require('@stoplight/spectral-functions');
module.exports = {
  rules: {
    'oas3-unused-components': 'error',
    'oas3-valid-oas-header-example': {
      type: 'validation',
      given:
        "$.paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' || @property === 'delete' || @property === 'options' || @property === 'head' || @property === 'patch' || @property === 'trace' )]",
      then: {
        function: truthy,
      },
    },
  },
};

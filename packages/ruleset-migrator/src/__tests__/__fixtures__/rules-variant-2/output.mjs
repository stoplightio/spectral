import { truthy } from "@stoplight/spectral-functions";
export default {
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

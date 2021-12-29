import donothing from '/.tmp/spectral/functions-variant-5/custom-functions/do-nothing.js';
export default {
  rules: {
    rule: {
      given: '$',
      then: {
        function: donothing,
      },
    },
  },
};

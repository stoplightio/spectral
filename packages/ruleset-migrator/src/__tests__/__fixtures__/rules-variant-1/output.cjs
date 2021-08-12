const { oas2: oas2 } = require('@stoplight/spectral-formats');
module.exports = {
  rules: {
    'oas3-schema': 'error',
    'oas2-operation-formData-consume-check': {
      description:
        'Operations with an `in: formData` parameter must include `application/x-www-form-urlencoded` or `multipart/form-data` in their `consumes` property.',
      recommended: true,
      formats: [oas2],
      type: 'validation',
      given:
        "$.paths.*[?( @property === 'get' || @property === 'put' || @property === 'post' || @property === 'delete' || @property === 'options' || @property === 'head' || @property === 'patch' || @property === 'trace' )]",
      then: {
        function: void 0,
        functionOptions: null,
      },
    },
  },
};

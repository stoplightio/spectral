const { truthy: truthy } = require('@stoplight/spectral-functions');
module.exports = {
  extends: [
    {
      rules: {
        'my-rule': {
          given: '$',
          then: {
            function: truthy,
          },
        },
      },
    },
  ],
};

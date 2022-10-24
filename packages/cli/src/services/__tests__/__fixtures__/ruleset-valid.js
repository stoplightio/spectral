const { pattern } = require('@stoplight/spectral-functions');

module.exports = {
  rules: {
    'info-matches-stoplight': {
      message: 'Info must contain Stoplight',
      given: '$.info',
      recommended: true,
      then: {
        field: 'title',
        function: pattern,
        functionOptions: {
          match: 'Stoplight'
        }
      },
    },
  },
};

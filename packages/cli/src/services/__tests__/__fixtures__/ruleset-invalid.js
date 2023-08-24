const { truthy } = require('@stoplight/spectral-functions');

module.exports = {
  'rules': {
    'rule-without-given-nor-them': {
      message: 'deliberately invalid'
    },
    'valid-rule': {
      message: 'should be OK',
      given: '$.info',
      then: {
        function: truthy,
      }
    },
    'rule-with-invalid-enum': {
      given: '$.info',
      then: {
        function: truthy
      },
      severity: 'some bs severity value',
      type: 'some bs type value',
    }
  }
}

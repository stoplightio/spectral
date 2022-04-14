import { truthy } from '@stoplight/spectral-functions';

export default {
  rules: {
    'no-given-no-then': {
      message: 'deliberately invalid',
    },
    'valid-rule': {
      message: 'should be OK',
      given: '$.info',
      then: {
        function: truthy,
      },
    },
    'rule-with-invalid-enum': {
      given: '$.info',
      then: {
        function: truthy,
      },
      severity: 'must not be a string',
      type: 'some bs type value',
    },
  },
};

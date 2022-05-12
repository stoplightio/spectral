import { truthy } from '@stoplight/spectral-functions';

export default {
  rules: {
    'valid-rule': {
      given: '$.info',
      then: {
        function: truthy,
      },
    },
  },
};

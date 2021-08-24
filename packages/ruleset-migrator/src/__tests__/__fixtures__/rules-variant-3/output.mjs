import { truthy, length as length$0 } from '@stoplight/spectral-functions';
export default {
  rules: {
    rule: {
      given: '$',
      then: {
        function: truthy,
      },
    },
    'valid-length': {
      given: '$',
      then: {
        function: length$0,
      },
    },
  },
};

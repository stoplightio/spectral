import myFn from './.spectral/my-fn.js';
import lowerCase from './.spectral/lower-case.js';
import upperCase from './.spectral/upper-case.js';

export default {
  rules: {
    'odd-rule': {
      given: '$',
      then: { function: myFn },
    },
    'upper-case-rule': {
      given: '$',
      then: { function: upperCase },
    },
    'lower-case-rule': {
      given: '$',
      then: { function: lowerCase },
    },
  },
};

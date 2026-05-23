import { truthy } from '@stoplight/spectral-functions';

// Test case: nested extends with 'off' severity and intermediate rule enable
// The key scenario is: grandparent -> parent (enables rule) -> child (extends with 'off')

const grandparent = {
  rules: {
    'my-rule': {
      given: '$',
      then: { function: truthy },
    },
    'my-rule-2': {
      given: '$',
      severity: 'error',
      then: { function: truthy },
    },
    'my-rule-3': {
      given: '$',
      severity: 'error',
      then: { function: truthy },
    },
  },
};

const parent = {
  extends: [[grandparent, 'off']],
  rules: {
    'my-rule': true,
    'my-rule-2': false,
    'my-rule-3': 'warn',
  },
};

export default {
  extends: [[parent, 'off']],
  rules: {},
};

import { truthy } from '@stoplight/spectral-functions';

// Test case 4: Non-recommended rule enabled then off
// grandparent (recommended:false) -> parent (enables with true) -> child (off)

const grandparent = {
  rules: {
    'my-rule': {
      given: '$',
      recommended: false,
      then: { function: truthy },
    },
  },
};

const parent = {
  extends: [grandparent],
  rules: {
    'my-rule': true,
  },
};

export default {
  extends: [[parent, 'off']],
  rules: {},
};

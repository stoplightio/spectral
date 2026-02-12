import { truthy } from '@stoplight/spectral-functions';

// Test case 2: Mixed severity modifiers followed by off
// grandparent -> parent (off, re-enables with 'warn') -> child (off)

const grandparent = {
  rules: {
    'my-rule': {
      given: '$',
      then: { function: truthy },
    },
  },
};

const parent = {
  extends: [[grandparent, 'off']],
  rules: {
    'my-rule': 'warn',
  },
};

export default {
  extends: [[parent, 'off']],
  rules: {},
};

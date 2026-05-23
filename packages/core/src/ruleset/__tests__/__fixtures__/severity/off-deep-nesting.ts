import { truthy } from '@stoplight/spectral-functions';

// Test case 1: Deep nesting (great-grandparent chain)
// great-grandparent -> grandparent (enables) -> parent (enables) -> child (off)

const greatGrandparent = {
  rules: {
    'my-rule': {
      given: '$',
      then: { function: truthy },
    },
  },
};

const grandparent = {
  extends: [[greatGrandparent, 'off']],
  rules: {
    'my-rule': true,
  },
};

const parent = {
  extends: [[grandparent, 'off']],
  rules: {
    'my-rule': true,
  },
};

export default {
  extends: [[parent, 'off']],
  rules: {},
};

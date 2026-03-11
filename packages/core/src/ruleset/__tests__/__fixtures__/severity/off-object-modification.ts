import { truthy } from '@stoplight/spectral-functions';

// Test case 3: Object rule modification followed by off
// grandparent -> parent (modifies rule with object) -> child (off)

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
    'my-rule': {
      given: '$.info',
      then: { function: truthy },
    },
  },
};

export default {
  extends: [[parent, 'off']],
  rules: {},
};

import { truthy } from '@stoplight/spectral-functions';
import type { RulesetDefinition } from '@stoplight/spectral-core';

// Test case 6: Child re-enables rule after extending with off
// grandparent -> parent -> child (extends with 'off', but re-enables my-rule with true)

const grandparent: RulesetDefinition = {
  rules: {
    'my-rule': {
      given: '$',
      then: { function: truthy },
    },
    'my-rule-2': {
      given: '$',
      then: { function: truthy },
    },
  },
};

const parent: RulesetDefinition = {
  extends: [grandparent],
  rules: {},
};

export default {
  extends: [[parent, 'off']],
  rules: {
    'my-rule': true,
  },
} as RulesetDefinition;

import parentRuleset from './indirect.2';
import { falsy } from '@stoplight/spectral-functions';
import { RulesetDefinition } from '@stoplight/spectral-core';

const ruleset: RulesetDefinition = {
  extends: parentRuleset,
  rules: {
    'foo-rule': {
      given: '$',
      then: {
        function: falsy,
      },
    },
  },
};

export { ruleset as default };

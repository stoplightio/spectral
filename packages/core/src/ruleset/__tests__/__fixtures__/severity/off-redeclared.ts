import { RulesetDefinition } from '@stoplight/spectral-core';
import shared from './shared';
import { truthy } from '@stoplight/spectral-functions/src';

export default {
  extends: [[shared, 'off']],
  rules: {
    'overridable-rule': {
      given: '$.foo',
      then: {
        function: truthy,
      },
    },
  },
} as RulesetDefinition;

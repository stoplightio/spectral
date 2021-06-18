import { oas2 } from '@stoplight/spectral-formats';
import { truthy } from '@stoplight/spectral-functions';
import type { RulesetDefinition } from '@stoplight/spectral-core';

export { ruleset as default };

const ruleset: RulesetDefinition = {
  formats: [oas2],
  rules: {
    'oas2-valid-rule': {
      message: 'should be OK',
      given: '$.info',
      then: {
        function: truthy,
      },
    },
  },
};


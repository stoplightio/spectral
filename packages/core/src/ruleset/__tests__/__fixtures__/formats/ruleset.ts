import { oas2, oas3 } from '@stoplight/spectral-formats';
import { truthy } from '@stoplight/spectral-functions';
import type { RulesetDefinition } from '@stoplight/spectral-core';
import oas2Ruleset from './oas2';
import oas3Ruleset from './oas3';

export { ruleset as default };

const ruleset: RulesetDefinition = {
  extends: [oas2Ruleset, oas3Ruleset],
  formats: [oas2, oas3],
  rules: {
    'generic-valid-rule': {
      message: 'should be OK',
      given: '$.info',
      then: {
        function: truthy,
      },
    },
  },
};

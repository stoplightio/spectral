import { RulesetDefinition } from '@stoplight/spectral-core';
import shared from './shared';

export default {
  extends: [[shared, 'off']],
  rules: {
    'overridable-rule': true,
  },
} as RulesetDefinition;

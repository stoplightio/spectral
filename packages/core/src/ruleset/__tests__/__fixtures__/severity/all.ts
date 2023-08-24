import shared from './shared';
import {RulesetDefinition} from "@stoplight/spectral-core";

export default {
  extends: [[shared, 'all']],
  rules: {
    'description-matches-stoplight': 'off',
  },
} as RulesetDefinition;

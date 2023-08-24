import { RulesetDefinition } from '@stoplight/spectral-core';

import _base from '../_base';

export { ruleset as default };

const ruleset: RulesetDefinition = {
  extends: [[_base, 'off']],
  overrides: [
    {
      files: ['**/*.json'],
      extends: [[_base, 'all']],
    },
  ],
};

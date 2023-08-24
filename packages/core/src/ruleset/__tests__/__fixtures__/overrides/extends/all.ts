import { RulesetDefinition } from '@stoplight/spectral-core';

import _base from '../_base';

export { ruleset as default };

const ruleset: RulesetDefinition = {
  overrides: [
    {
      files: ['**/*.json'],
      extends: [[_base, 'all']],
    },
  ],
};

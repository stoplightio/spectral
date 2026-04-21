import { RulesetDefinition } from '@stoplight/spectral-core';

import _scope from './scope';

export { ruleset as default };

const ruleset: RulesetDefinition = {
  extends: [
    [_scope, 'all'],
  ],
};
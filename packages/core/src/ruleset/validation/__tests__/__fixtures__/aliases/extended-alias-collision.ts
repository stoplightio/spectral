import { RulesetDefinition } from '@stoplight/spectral-core';

import _scope from './scope';
import _desc from './description-check';


export { ruleset as default };

const ruleset: RulesetDefinition = {
  extends: [
    _scope,
    _desc,
  ],
};

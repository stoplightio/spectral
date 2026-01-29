import { RulesetDefinition } from '@stoplight/spectral-core';

import _scope from './scope';
import _version from './version-check';


export { ruleset as default };

const ruleset: RulesetDefinition = {
  extends: [
    _scope,
    _version,
  ],
};

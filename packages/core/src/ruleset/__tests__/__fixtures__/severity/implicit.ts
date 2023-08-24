import type { RulesetDefinition } from '@stoplight/spectral-core';
import shared from './shared';

export { ruleset as default };

const ruleset: RulesetDefinition = {
  extends: shared,
};

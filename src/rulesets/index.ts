const merge = require('lodash.merge');

import { IRuleset } from '../types';
import { oas2Ruleset } from './oas2';
import { oas3Ruleset } from './oas3';

export const allPreset = (): IRuleset => {
  return merge(oas2Ruleset(), oas3Ruleset(), {
    name: 'all',
  });
};

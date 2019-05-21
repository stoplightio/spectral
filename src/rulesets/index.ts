import { oas2Functions } from './oas2';
import * as oas2Ruleset from './oas2/ruleset.json';
import { oas3Functions } from './oas3';
import * as oas3Ruleset from './oas3/ruleset.json';

const merge = require('lodash/merge');

export const defaultRules = () => {
  return merge(oas2Ruleset.rules, oas3Ruleset.rules);
};

export const defaultFunctions = () => {
  return merge(oas2Functions(), oas3Functions());
};

import { oas2Functions, oas2Rules } from './oas2';
import { oas3Functions, oas3Rules } from './oas3';

const merge = require('lodash/merge');

export const defaultRules = () => {
  return merge(oas2Rules(), oas3Rules());
};

export const defaultFunctions = () => {
  return merge(oas2Functions(), oas3Functions());
};

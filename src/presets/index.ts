const merge = require('lodash.merge');

import { IPreset } from '../types';
import { oas2Preset } from './oas2';
import { oas3Preset } from './oas3';

export const allPreset = (): IPreset => {
  return {
    name: 'all',
    rules: merge(oas2Preset().rules, oas3Preset().rules),
  };
};

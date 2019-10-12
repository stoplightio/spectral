import { FunctionCollection } from '../../types';
import { readRuleset } from '../reader';

import { oas2Functions } from '../oas2';
import { oas3Functions } from '../oas3';

export const commonOasFunctions = (): FunctionCollection => {
  console.warn('This is deprecated. Use loadRuleset method instead');
  return {
    ...oas2Functions(),
    ...oas3Functions(),
  };
};

export const rules = async () => {
  console.warn('This is deprecated. Use loadRuleset method instead');
  return (await readRuleset(require.resolve('./index.json'))).rules;
};

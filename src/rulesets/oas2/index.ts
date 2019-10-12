import { readRuleset } from '../reader';

export { commonOasFunctions as oas2Functions } from '../oas-common';

export const rules = async () => {
  console.warn('This is deprecated. Use loadRuleset method instead');
  return (await readRuleset(require.resolve('./index.json'))).rules;
};

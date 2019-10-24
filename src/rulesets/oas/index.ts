import { FunctionCollection } from '../../types';
import { readRuleset } from '../reader';

export const commonOasFunctions = (): FunctionCollection => {
  console.warn('This is deprecated. Use loadRuleset method instead');
  return {
    oasPathParam: require('./functions/oasPathParam').oasPathParam,
    oasOp2xxResponse: require('./functions/oasOp2xxResponse').oasOp2xxResponse,
    oasOpSecurityDefined: require('./functions/oasOpSecurityDefined').oasOpSecurityDefined, // used in oas2/oas3 differently see their rulesets for details
    oasOpIdUnique: require('./functions/oasOpIdUnique').oasOpIdUnique,
    oasOpFormDataConsumeCheck: require('./functions/oasOpFormDataConsumeCheck').oasOpFormDataConsumeCheck,
    oasOpParams: require('./functions/oasOpParams').oasOpParams,
    oasTagDefined: require('./functions/oasTagDefined').oasTagDefined,
    refSiblings: require('./functions/refSiblings').refSiblings,
  };
};

export const rules = async () => {
  console.warn('This is deprecated. Use loadRuleset method instead');
  return (await readRuleset(require.resolve('./index.json'))).rules;
};

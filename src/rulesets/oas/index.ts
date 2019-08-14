import { FunctionCollection } from '../../types';
import { readRuleset } from '../reader';

export const commonOasFunctions = (): FunctionCollection => {
  return {
    oasPathParam: require('./functions').oasPathParam,
    oasOp2xxResponse: require('./functions/oasOp2xxResponse').oasOp2xxResponse,
    oasOpSecurityDefined: require('./functions/oasOpSecurityDefined').oasOpSecurityDefined, // used in oas2/oas3 differently see their rulesets for details
    oasOpIdUnique: require('./functions/oasOpIdUnique').oasOpIdUnique,
    oasOpFormDataConsumeCheck: require('./functions/oasOpFormDataConsumeCheck').oasOpFormDataConsumeCheck,
    oasOpParams: require('./functions').oasOpParams,
  };
};

export const rules = async () => (await readRuleset(require.resolve('./index.json'))).rules;

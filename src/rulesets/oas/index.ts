import { FunctionCollection } from '../../types';

export const operationPath =
  "$..paths.*[?( name() === 'get' || name() === 'put' || name() === 'post'" +
  " || name() === 'delete' || name() === 'options' || name() === 'head'" +
  " || name() === 'patch' || name() === 'trace' )]";

export const commonOasFunctions = (): FunctionCollection => {
  return {
    oasPathParam: require('./functions/oasPathParam').oasPathParam,
    oasOp2xxResponse: require('./functions/oasOp2xxResponse').oasOp2xxResponse,
    oasOpSecurityDefined: require('./functions/oasOpSecurityDefined').oasOpSecurityDefined, // used in oas2/oas3 differently see their rulesets for details
    oasOpIdUnique: require('./functions/oasOpIdUnique').oasOpIdUnique,
    oasOpFormDataConsumeCheck: require('./functions/oasOpFormDataConsumeCheck').oasOpFormDataConsumeCheck,
    oasOpParams: require('./functions/oasOpParams').oasOpParams,
  };
};

import * as types from '../types';
import { alphabetical, truthy, or, xor, pattern, notContain, notEndWith, maxLength } from './style';
import { schema } from './validation';

export const ensureRule = (
  shouldAssertion: Function,
  ruleMeta: types.IRuleMetadata
): void | types.IRuleResult => {
  try {
    shouldAssertion();
  } catch (error) {
    // rethrow when not a lint error
    if (!error.name || error.name !== 'AssertionError') {
      throw error;
    }

    return {
      path: ruleMeta.path,
      name: ruleMeta.name,
      type: ruleMeta.rule.type,
      summary: ruleMeta.rule.summary,
      severity: ruleMeta.rule.severity ? ruleMeta.rule.severity : 'warn',
      message: error.message ? error.message : '',
    };
  }
};

export const generateRule = (
  r: types.Rule
): ((object: any, r: types.Rule, ruleMeta: types.IRuleMetadata) => types.IRuleResult[]) => {
  switch (r.function) {
    case 'truthy':
      return truthy;
      break;
    case 'alphabetical':
      return alphabetical;
      break;
    case 'or':
      return or;
      break;
    case 'xor':
      return xor;
      break;
    case 'pattern':
      return pattern;
      break;
    case 'notContain':
      return notContain;
      break;
    case 'notEndWith':
      return notEndWith;
      break;
    case 'maxLength':
      return maxLength;
      break;
    case 'schema':
      return schema;
      break;
  }
};

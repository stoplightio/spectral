import * as types from '../types';
import {
  alphabetical,
  truthy,
  or,
  xor,
  pattern,
  notContain,
  notEndWith,
  maxLength,
  functionRule,
} from './lint';
import { schema } from './validation';

export const ensureRule = (shouldAssertion: Function): void | types.RawResult => {
  try {
    shouldAssertion();
  } catch (error) {
    // rethrow when not a lint error
    if (!error.name || error.name !== 'AssertionError') {
      throw error;
    }

    return error;
  }
};

export const generateRule = (r: types.Rule): ((object: any) => types.RawResult[]) => {
  switch (r.type) {
    case 'truthy':
      return truthy(r);
      break;
    case 'alphabetical':
      return alphabetical(r);
      break;
    case 'or':
      return or(r);
      break;
    case 'xor':
      return xor(r);
      break;
    case 'pattern':
      return pattern(r);
      break;
    case 'notContain':
      return notContain(r);
      break;
    case 'notEndWith':
      return notEndWith(r);
      break;
    case 'maxLength':
      return maxLength(r);
      break;
    case 'schema':
      return schema(r);
      break;
    case 'function':
      return functionRule(r);
      break;
  }
};

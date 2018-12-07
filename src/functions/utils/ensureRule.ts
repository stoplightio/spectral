import { ObjPath } from '@stoplight/types/parsers';
import { IRuleResult } from '../../types';

export const ensureRule = (shouldAssertion: Function, path: ObjPath): void | IRuleResult => {
  try {
    shouldAssertion();
  } catch (error) {
    // rethrow when not a lint error
    if (!error.name || error.name !== 'AssertionError') {
      throw error;
    }

    return {
      path,
      message: error.message ? error.message : '',
    };
  }
};

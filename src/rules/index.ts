import * as types from '../types';
import * as StyleRules from './style';
import * as ValidationRules from './validation';

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

export const generateRule = (r: types.Rule): types.IRuleFunction<types.Rule> | undefined => {
  return ValidationRules[r.function] || StyleRules[r.function];
};

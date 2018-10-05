import * as types from '../../types';

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

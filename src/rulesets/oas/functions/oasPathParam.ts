import { ensureRule } from '../../../functions/utils/ensureRule';
import { IRuleFunction, IRuleResult, Rule } from '../../../types';

export const oasPathParam: IRuleFunction<Rule> = (_object, _r, ruleMeta) => {
  const results: IRuleResult[] = [];

  /**
   * TODO: this is just a silly example
   * in reality, need to check:
   *
   * 1. for every param defined in the path string ie /users/{userId}, var must be defined in either path.parameters, or operation.parameters object
   * 2. every path.parameters + operation.parameters property must be used in the path string
   */

  const res = ensureRule(() => {
    const hasPathParam = (ruleMeta.path[2] as string).match('{');
    if (hasPathParam) {
      hasPathParam.should.be.false('It is using a path param!');
    }
  }, ruleMeta);

  if (res) {
    results.push(res);
  }

  return results;
};

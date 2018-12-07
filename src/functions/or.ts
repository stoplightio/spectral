import { IOrRule, IRuleFunction, IRuleOpts, IRuleResult } from '../types';
import { IFunctionPaths } from '../types/spectral';
import { ensureRule } from './utils/ensureRule';

export const or: IRuleFunction<IOrRule> = (opts: IRuleOpts<IOrRule>, paths: IFunctionPaths) => {
  const results: IRuleResult[] = [];

  const { object, rule } = opts;
  const { properties } = rule.then.functionOptions;

  let found = false;
  for (const property of properties) {
    if (typeof object[property] !== 'undefined') {
      found = true;
      break;
    }
  }
  const res = ensureRule(() => {
    found.should.be.exactly(true, rule.description);
  }, paths.given);

  if (res) {
    results.push(res);
  }
  return results;
};

import { IOrRule, IRuleFunction, IRuleOpts, IRuleResult } from '../types';
import { ensureRule } from './utils/ensureRule';

export const or: IRuleFunction<IOrRule> = (opts: IRuleOpts<IOrRule>) => {
  const results: IRuleResult[] = [];

  const { object, rule, meta } = opts;
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
  }, meta);

  if (res) {
    results.push(res);
  }
  return results;
};

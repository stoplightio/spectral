import { IRuleResult, IRuleFunction, IOrRule } from '../../types';
import { ensureRule } from '../index';

export const or: IRuleFunction<IOrRule> = (object, r, ruleMeta) => {
  const results: IRuleResult[] = [];

  const { properties } = r.input;

  let found = false;
  for (const property of properties) {
    if (typeof object[property] !== 'undefined') {
      found = true;
      break;
    }
  }
  const res = ensureRule(() => {
    found.should.be.exactly(true, r.description);
  }, ruleMeta);
  if (res) {
    results.push(res);
  }
  return results;
};

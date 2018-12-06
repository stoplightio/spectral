import * as should from 'should';
import { IOrRule, IRuleFunction, IRuleOpts, IRuleResult } from '../types';
import { ensureRule } from './utils/ensureRule';
import { countExistingProperties } from './utils/object';

export const or: IRuleFunction<IOrRule> = (opts: IRuleOpts<IOrRule>) => {
  const results: IRuleResult[] = [];

  const { object, rule, meta } = opts;
  const { properties } = rule.input;

  const found = countExistingProperties(object, properties) > 0;
  const res = ensureRule(() => {
    should(found).be.exactly(true, rule.description);
  }, meta);

  if (res) {
    results.push(res);
  }
  return results;
};

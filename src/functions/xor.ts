import * as should from 'should';
import { IRuleFunction, IRuleOpts, IRuleResult, IXorRule } from '../types';
import { ensureRule } from './utils/ensureRule';
import { countExistingProperties } from './utils/object';

export const xor: IRuleFunction<IXorRule> = (opts: IRuleOpts<IXorRule>) => {
  const results: IRuleResult[] = [];

  const { object, rule, meta } = opts;
  const { properties } = rule.input;

  const found = countExistingProperties(object, properties) === 1;
  const res = ensureRule(() => {
    should(found).be.exactly(true, rule.summary);
  }, meta);

  if (res) {
    results.push(res);
  }

  return results;
};

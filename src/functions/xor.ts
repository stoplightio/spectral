import { IRuleFunction, IRuleOpts, IRuleResult, IXorRule } from '../types';
import { ensureRule } from './utils/ensureRule';

import * as should from 'should';

export const xor: IRuleFunction<IXorRule> = (opts: IRuleOpts<IXorRule>) => {
  const results: IRuleResult[] = [];

  const { object, rule, meta } = opts;
  const { properties } = rule.input;

  let found = false;
  for (const property of properties) {
    if (typeof object[property] !== 'undefined') {
      if (found) {
        const innerRes = ensureRule(() => {
          should.fail(true, false, rule.summary);
        }, meta);

        if (innerRes) {
          results.push(innerRes);
        }
      }

      found = true;
    }
  }

  const res = ensureRule(() => {
    found.should.be.exactly(true, rule.summary);
  }, meta);

  if (res) {
    results.push(res);
  }

  return results;
};

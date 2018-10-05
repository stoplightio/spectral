import { IRuleFunction, IRuleResult, IXorRule } from '../types';
import { ensureRule } from './utils/ensureRule';

import * as should from 'should';

export const xor: IRuleFunction<IXorRule> = (object, r, ruleMeta) => {
  const results: IRuleResult[] = [];

  const { properties } = r.input;

  let found = false;
  for (const property of properties) {
    if (typeof object[property] !== 'undefined') {
      if (found) {
        const innerRes = ensureRule(() => {
          should.fail(true, false, r.summary);
        }, ruleMeta);

        if (innerRes) {
          results.push(innerRes);
        }
      }

      found = true;
    }
  }

  const res = ensureRule(() => {
    found.should.be.exactly(true, r.summary);
  }, ruleMeta);

  if (res) {
    results.push(res);
  }

  return results;
};

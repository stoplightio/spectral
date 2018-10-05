import { IRuleResult, IRuleFunction } from '../../types';
import { ensureRule } from '../index';

import * as should from 'should';

export const xor: IRuleFunction = (object, r, ruleMeta) => {
  const results: IRuleResult[] = [];

  const { properties } = r.input;

  let found = false;
  for (const property of properties) {
    if (typeof object[property] !== 'undefined') {
      if (found) {
        const res = ensureRule(() => {
          should.fail(true, false, r.summary);
        }, ruleMeta);
        if (res) {
          results.push(res);
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

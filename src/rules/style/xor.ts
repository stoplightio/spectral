import { IXorRule, IRuleResult, IRuleMetadata } from '../../types';
import { ensureRule } from '../index';

import * as should from 'should';

export const xor = (r: IXorRule): ((object: any, ruleMeta: IRuleMetadata) => IRuleResult[]) => {
  return (object: object, ruleMeta: IRuleMetadata): IRuleResult[] => {
    const results: IRuleResult[] = [];

    let found = false;
    for (const property of r.input.xor) {
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
};

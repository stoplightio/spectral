import { IXorRule } from 'spectral/types';
import { ensureRule } from 'spectral/rules';

import * as should from 'should';
import { AssertionError } from 'assert';

export const xor = (r: IXorRule): ((object: any) => AssertionError[]) => {
  return (object: object): AssertionError[] => {
    const results: AssertionError[] = [];

    let found = false;
    for (const property of r.xor) {
      if (typeof object[property] !== 'undefined') {
        if (found) {
          const res = ensureRule(() => {
            should.fail(true, false, r.description);
          });
          if (res) {
            results.push(res);
          }
        }
        found = true;
      }
    }

    const res = ensureRule(() => {
      found.should.be.exactly(true, r.description);
    });
    if (res) {
      results.push(res);
    }

    return results;
  };
};

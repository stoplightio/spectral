import { IXorRule, RawResult } from '@spectral/types';
import { ensureRule } from '@spectral/rules';

import * as should from 'should';

export const xor = (r: IXorRule): ((object: any) => RawResult[]) => {
  return (object: object): RawResult[] => {
    const results: RawResult[] = [];

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

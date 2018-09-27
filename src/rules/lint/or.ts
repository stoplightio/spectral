import { IOrRule, RawResult } from '@spectral/types';
import { ensureRule } from '@spectral/rules';

export const or = (r: IOrRule): ((object: any) => RawResult[]) => {
  return (object: object): RawResult[] => {
    const results: RawResult[] = [];

    let found = false;
    for (const property of r.or) {
      if (typeof object[property] !== 'undefined') {
        found = true;
        break;
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

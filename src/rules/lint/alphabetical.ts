import { IAlphaRule, RawResult } from '@spectral/types';
import { ensureRule } from '@spectral/rules';

export const alphabetical = (r: IAlphaRule): ((object: any) => RawResult[]) => {
  return (object: object): RawResult[] => {
    const results: RawResult[] = [];
    if (r.alphabetical.properties && !Array.isArray(r.alphabetical.properties)) {
      r.alphabetical.properties = [r.alphabetical.properties];
    }

    for (const property of r.alphabetical.properties) {
      if (!object[property] || object[property].length < 2) {
        continue;
      }

      const arrayCopy: object[] = object[property].slice(0);

      // If we aren't expecting an object keyed by a specific property, then treat the
      // object as a simple array.
      if (r.alphabetical.keyedBy) {
        const keyedBy = r.alphabetical.keyedBy;
        arrayCopy.sort((a, b) => {
          if (a[keyedBy] < b[keyedBy]) {
            return -1;
          } else if (a[keyedBy] > b[keyedBy]) {
            return 1;
          }
          return 0;
        });
      } else {
        arrayCopy.sort();
      }

      const res = ensureRule(() => {
        object.should.have.property(property);
        object[property].should.be.deepEqual(arrayCopy);
      });
      if (res) {
        results.push(res);
      }
    }
    return results;
  };
};

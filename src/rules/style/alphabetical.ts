import { IAlphaRule, IRuleResult, IRuleMetadata } from '../../types';
import { ensureRule } from '../index';

export const alphabetical = (
  r: IAlphaRule
): ((object: any, ruleMeta: IRuleMetadata) => IRuleResult[]) => {
  return (object: object, ruleMeta: IRuleMetadata): IRuleResult[] => {
    const results: IRuleResult[] = [];

    const { keyedBy, properties: inputProperties } = r.input;

    let properties = inputProperties;
    if (properties && !Array.isArray(properties)) {
      properties = [properties];
    }

    for (const property of properties) {
      if (!object[property] || object[property].length < 2) {
        continue;
      }

      const arrayCopy: object[] = object[property].slice(0);

      // If we aren't expecting an object keyed by a specific property, then treat the
      // object as a simple array.
      if (keyedBy) {
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
      }, ruleMeta);
      if (res) {
        results.push(res);
      }
    }
    return results;
  };
};

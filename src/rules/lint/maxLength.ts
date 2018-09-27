import { IMaxLengthRule } from '@spectral/types';
import { ensureRule } from '@spectral/rules';

import { AssertionError } from 'assert';

export const maxLength = (r: IMaxLengthRule): ((object: any) => AssertionError[]) => {
  return (object: object): AssertionError[] => {
    const results: AssertionError[] = [];
    const { value, property = undefined } = r.maxLength;

    let target: any;
    if (property) {
      if (object[property] && typeof object[property] === 'string') {
        target = object[property];
      }
    } else {
      target = object;
    }

    if (target) {
      const res = ensureRule(() => {
        target.length.should.be.belowOrEqual(value);
      });
      if (res) {
        results.push(res);
      }
    }
    return results;
  };
};

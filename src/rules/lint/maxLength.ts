import { IMaxLengthRule, RawResult } from '../../types';
import { ensureRule } from '../index';

export const maxLength = (r: IMaxLengthRule): ((object: any) => RawResult[]) => {
  return (object: object): RawResult[] => {
    const results: RawResult[] = [];
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

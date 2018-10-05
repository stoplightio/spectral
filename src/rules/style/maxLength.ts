import { IMaxLengthRule, IRuleResult, IRuleMetadata } from '../../types';
import { ensureRule } from '../index';

export const maxLength = (object: any, r: IMaxLengthRule, meta: IRuleMetadata): IRuleResult[] => {
  const results: IRuleResult[] = [];
  const { value, property } = r.input;

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
    }, meta);
    if (res) {
      results.push(res);
    }
  }
  return results;
};

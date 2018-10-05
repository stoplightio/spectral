import { IRuleResult, IRuleFunction, IMaxLengthRule } from '../../types';
import { ensureRule } from '../index';

export const maxLength: IRuleFunction<IMaxLengthRule> = (object, r, meta) => {
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

const get = require('lodash/get');
import { IMaxLengthRule, IRuleFunction, IRuleOpts, IRuleResult } from '../types';
import { ensureRule } from './utils/ensureRule';

export const maxLength: IRuleFunction<IMaxLengthRule> = (opts: IRuleOpts<IMaxLengthRule>) => {
  const results: IRuleResult[] = [];

  const { object, rule, meta } = opts;

  const { value, property } = rule.input;

  let target: any;
  if (property) {
    const val = get(object, property);
    if (typeof val === 'string') {
      target = val;
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

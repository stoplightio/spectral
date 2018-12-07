import { IMaxLengthRule, IRuleFunction, IRuleOpts, IRuleResult } from '../types';
import { IFunctionPaths } from '../types/spectral';
import { ensureRule } from './utils/ensureRule';

export const maxLength: IRuleFunction<IMaxLengthRule> = (opts: IRuleOpts<IMaxLengthRule>, paths: IFunctionPaths) => {
  const results: IRuleResult[] = [];

  const { object, rule } = opts;

  const { value, property } = rule.then.functionOptions;

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
    }, paths.given);

    if (res) {
      results.push(res);
    }
  }
  return results;
};

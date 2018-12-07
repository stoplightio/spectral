import { INotEndWithRule, IRuleFunction, IRuleOpts, IRuleResult } from '../types';
import { IFunctionPaths } from '../types/spectral';
import { ensureRule } from './utils/ensureRule';

export const notEndWith: IRuleFunction<INotEndWithRule> = (opts: IRuleOpts<INotEndWithRule>, paths: IFunctionPaths) => {
  const results: IRuleResult[] = [];
  let { object } = opts;
  const { rule } = opts;
  const { value, property } = rule.then.functionOptions;

  const process = (target: any) => {
    const res = ensureRule(() => {
      target.should.not.endWith(value);
    }, paths.given);

    if (res) {
      results.push(res);
    }
  };

  if (property === '*') {
    object = Object.keys(object);
  }

  if (Array.isArray(object)) {
    object.forEach((obj: any) => {
      if (property && obj[property]) {
        process(obj[property]);
      }
    });
  } else if (property && object[property]) {
    process(object[property]);
  }
  return results;
};

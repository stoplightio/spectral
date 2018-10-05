import { INotEndWithRule, IRuleFunction, IRuleResult } from '../types';
import { ensureRule } from './utils/ensureRule';

export const notEndWith: IRuleFunction<INotEndWithRule> = (object, r, ruleMeta) => {
  const results: IRuleResult[] = [];
  const { value, property } = r.input;
  const process = (target: any) => {
    const res = ensureRule(() => {
      target.should.not.endWith(value);
    }, ruleMeta);

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

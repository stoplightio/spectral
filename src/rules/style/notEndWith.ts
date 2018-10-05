import { IRuleResult, IRuleFunction } from '../../types';
import { ensureRule } from '../index';

export const notEndWith: IRuleFunction = (object, r, ruleMeta) => {
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
      if (obj[property]) {
        process(obj[property]);
      }
    });
  } else if (object[property]) {
    process(object[property]);
  }
  return results;
};

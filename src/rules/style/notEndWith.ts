import { INotEndWithRule, IRuleResult, IRuleMetadata } from '../../types';
import { ensureRule } from '../index';

export const notEndWith = (
  r: INotEndWithRule
): ((object: any, ruleMeta: IRuleMetadata) => IRuleResult[]) => {
  return (object: object, ruleMeta: IRuleMetadata): IRuleResult[] => {
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
};

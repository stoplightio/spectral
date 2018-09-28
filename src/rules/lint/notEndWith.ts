import { INotEndWithRule, RawResult } from '../../types';
import { ensureRule } from '../index';

export const notEndWith = (r: INotEndWithRule): ((object: any) => RawResult[]) => {
  return (object: object): RawResult[] => {
    const results: RawResult[] = [];
    const { value, property } = r.notEndWith;
    const process = (target: any) => {
      const res = ensureRule(() => {
        target.should.not.endWith(value);
      });
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

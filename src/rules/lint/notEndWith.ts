import { INotEndWithRule } from 'spectral/types';
import { ensureRule } from 'spectral/rules';

import { AssertionError } from 'assert';

export const notEndWith = (r: INotEndWithRule): ((object: any) => AssertionError[]) => {
  return (object: object): AssertionError[] => {
    const results: AssertionError[] = [];
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

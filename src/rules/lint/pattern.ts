import { IPatternRule } from '@spectral/types';
import { ensureRule } from '@spectral/rules';

import * as should from 'should';
import { AssertionError } from 'assert';

export const pattern = (r: IPatternRule): ((object: any) => AssertionError[]) => {
  return (object: object): AssertionError[] => {
    const results: AssertionError[] = [];
    const { omit, property, split, value } = r.pattern;

    // if the collected object is not an object/array, set our target to be
    // the object itself
    let target: any;
    if (typeof object === 'object') {
      if (property === '*') {
        target = Object.keys(object);
      } else {
        target = object[property];
      }
    } else {
      target = object;
    }

    if (target) {
      const process = (target: any) => {
        let components = [];
        if (split) {
          components = target.split(split);
        } else {
          components.push(target);
        }

        const re = new RegExp(value);
        for (let component of components) {
          if (omit) component = component.split(omit).join('');
          if (component) {
            const res = ensureRule(() => {
              should(re.test(component)).be.exactly(
                true,
                `${r.description}, but received: ${component}`
              );
            });
            if (res) {
              results.push(res);
            }
          }
        }
      };

      if (Array.isArray(target)) {
        target.forEach(process);
      } else {
        process(target);
      }
    }
    return results;
  };
};

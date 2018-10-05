import { IPatternRule, IRuleResult, IRuleMetadata } from '../../types';
import { ensureRule } from '../index';

import * as should from 'should';

export const pattern = (object: any, r: IPatternRule, ruleMeta: IRuleMetadata): IRuleResult[] => {
  const results: IRuleResult[] = [];
  const { omit, property, split, value } = r.input;

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
            should(re.test(component)).be.exactly(true, `${r.summary}, but received: ${component}`);
          }, ruleMeta);
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

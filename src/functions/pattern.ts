import { IPatternRule, IRuleFunction, IRuleOpts, IRuleResult } from '../types';
import { ensureRule } from './utils/ensureRule';

// @ts-ignore
const get = require('lodash/get');
import * as should from 'should';

export const pattern: IRuleFunction<IPatternRule> = (opts: IRuleOpts<IPatternRule>) => {
  const results: IRuleResult[] = [];

  const { object, rule, meta } = opts;
  const { omit, property, split, value } = rule.input;

  // if the collected object is not an object/array, set our target to be
  // the object itself
  let target: any;
  if (typeof object === 'object') {
    // TODO(SO-9): isn't this misleading? I would expect that rule will be applied to all VALUES, not KEYS.
    if (property === '*') {
      target = Object.keys(object);
    } else if (property) {
      target = get(object, property);
    }
  } else {
    target = object;
  }

  if (target) {
    const process = (processTarget: any) => {
      let components = [];
      if (split) {
        components = processTarget.split(split);
      } else {
        components.push(processTarget);
      }

      const re = new RegExp(value);
      for (let component of components) {
        if (omit) component = component.split(omit).join('');
        if (component) {
          const res = ensureRule(() => {
            should(re.test(component)).be.exactly(true, `${rule.summary}, but received: ${component}`);
          }, meta);

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

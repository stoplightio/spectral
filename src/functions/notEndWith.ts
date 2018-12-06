const get = require('lodash/get');
import { INotEndWithRule, IRuleFunction, IRuleOpts, IRuleResult } from '../types';
import { ensureRule } from './utils/ensureRule';

export const notEndWith: IRuleFunction<INotEndWithRule> = (opts: IRuleOpts<INotEndWithRule>) => {
  const results: IRuleResult[] = [];
  let { object } = opts;
  const { rule, meta } = opts;
  const { value, property } = rule.input;

  const process = (prop: undefined | string | string[], o: any) => {
    if (!prop) {
      return;
    }
    const target = get(o, prop);
    const res = ensureRule(() => {
      target.should.not.endWith(value);
    }, meta);

    if (res) {
      results.push(res);
    }
  };

  // TODO(SO-9): I think this is buggy. If *, we replace object with its keys, but later we do object_key[*] (see #32)
  if (property === '*') {
    object = Object.keys(object);
  }

  if (Array.isArray(object)) {
    object.forEach((obj: any) => {
      process(property, obj);
    });
  } else {
    process(property, object);
  }
  return results;
};

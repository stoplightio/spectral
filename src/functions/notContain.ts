import { get, has } from 'lodash';
import { INotContainRule, IRuleFunction, IRuleOpts, IRuleResult } from '../types';
import { ensureRule } from './utils/ensureRule';

const regexFromString = (regex: string) => new RegExp(regex.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'));

export const notContain: IRuleFunction<INotContainRule> = (opts: IRuleOpts<INotContainRule>) => {
  const results: IRuleResult[] = [];

  const { object, rule, meta } = opts;
  const { value, properties } = rule.input;

  // TODO(SO-9): this is a bug. 'Property' can be a string. For of will work because string is iterable, but this is not what
  // I think was intended. A unit test would help here.
  for (const property of properties) {
    if (has(object, property)) {
      const res = ensureRule(() => {
        get(object, property)
          .should.be.a.String()
          .and.not.match(regexFromString(value), rule.description);
      }, meta);

      if (res) {
        results.push(res);
      }
    }
  }
  return results;
};

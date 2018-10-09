import { INotContainRule, IRuleFunction, IRuleOpts, IRuleResult } from '../types';
import { ensureRule } from './utils/ensureRule';

const regexFromString = (regex: string) =>
  new RegExp(regex.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'));

export const notContain: IRuleFunction<INotContainRule> = (opts: IRuleOpts<INotContainRule>) => {
  const results: IRuleResult[] = [];

  const { object, rule, meta } = opts;
  const { value, properties } = rule.input;

  for (const property of properties) {
    if (object && object.hasOwnProperty(property)) {
      const res = ensureRule(() => {
        object[property].should.be.a
          .String()
          .and.not.match(regexFromString(value), rule.description);
      }, meta);

      if (res) {
        results.push(res);
      }
    }
  }
  return results;
};

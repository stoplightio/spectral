import { INotContainRule, IRuleFunction, IRuleResult } from '../types';
import { ensureRule } from './utils/ensureRule';

const regexFromString = (regex: string) =>
  new RegExp(regex.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'));

export const notContain: IRuleFunction<INotContainRule> = (object, r, ruleMeta) => {
  const results: IRuleResult[] = [];
  const { value, properties } = r.input;

  for (const property of properties) {
    if (object && object.hasOwnProperty(property)) {
      const res = ensureRule(() => {
        object[property].should.be.a.String().and.not.match(regexFromString(value), r.description);
      }, ruleMeta);

      if (res) {
        results.push(res);
      }
    }
  }
  return results;
};

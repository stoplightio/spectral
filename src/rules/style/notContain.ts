import { INotContainRule, IRuleResult, IRuleMetadata } from '../../types';
import { ensureRule } from '../index';

const regexFromString = (regex: string) =>
  new RegExp(regex.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'));

export const notContain = (
  object: any,
  r: INotContainRule,
  ruleMeta: IRuleMetadata
): IRuleResult[] => {
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

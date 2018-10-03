import { INotContainRule, IRuleResult, IRuleMetadata } from '../../types';
import { ensureRule } from '../index';

const regexFromString = (regex: string) =>
  new RegExp(regex.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'));

export const notContain = (
  r: INotContainRule
): ((object: any, ruleMeta: IRuleMetadata) => IRuleResult[]) => {
  return (obj: object, meta: IRuleMetadata): IRuleResult[] => {
    const results: IRuleResult[] = [];
    const { value, properties } = r.input;

    for (const property of properties) {
      if (obj && obj.hasOwnProperty(property)) {
        const res = ensureRule(() => {
          obj[property].should.be.a.String().and.not.match(regexFromString(value), r.description);
        }, meta);
        if (res) {
          results.push(res);
        }
      }
    }
    return results;
  };
};

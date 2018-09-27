import { INotContainRule, RawResult } from '@spectral/types';
import { ensureRule } from '@spectral/rules';

const regexFromString = (regex: string) =>
  new RegExp(regex.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'));

export const notContain = (r: INotContainRule): ((object: any) => RawResult[]) => {
  return (obj: object): RawResult[] => {
    const results: RawResult[] = [];
    const { value, properties } = r.notContain;

    for (const property of properties) {
      if (obj && obj.hasOwnProperty(property)) {
        const res = ensureRule(() => {
          obj[property].should.be.a.String().and.not.match(regexFromString(value), r.description);
        });
        if (res) {
          results.push(res);
        }
      }
    }
    return results;
  };
};

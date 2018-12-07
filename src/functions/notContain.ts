import { INotContainRule, IRuleFunction, IRuleOpts, IRuleResult } from '../types';
import { IFunctionPaths } from '../types/spectral';
import { ensureRule } from './utils/ensureRule';

const regexFromString = (regex: string) => new RegExp(regex.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'));

export const notContain: IRuleFunction<INotContainRule> = (opts: IRuleOpts<INotContainRule>, paths: IFunctionPaths) => {
  const results: IRuleResult[] = [];

  const { object, rule } = opts;
  const { value, properties } = rule.then.functionOptions;

  for (const property of properties) {
    if (object && object.hasOwnProperty(property)) {
      const res = ensureRule(() => {
        object[property].should.be.a.String().and.not.match(regexFromString(value), rule.description);
      }, paths.given);

      if (res) {
        results.push(res);
      }
    }
  }
  return results;
};

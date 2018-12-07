import { IRuleFunction, IRuleOpts, IRuleResult, IXorRule } from '../types';
import { ensureRule } from './utils/ensureRule';

import * as should from 'should';
import { IFunctionPaths } from '../types/spectral';

export const xor: IRuleFunction<IXorRule> = (opts: IRuleOpts<IXorRule>, paths: IFunctionPaths) => {
  const results: IRuleResult[] = [];

  const { object, rule } = opts;
  const { properties } = rule.then.functionOptions;

  let found = false;
  for (const property of properties) {
    if (typeof object[property] !== 'undefined') {
      if (found) {
        const innerRes = ensureRule(() => {
          should.fail(true, false, rule.summary);
        }, paths.given);

        if (innerRes) {
          results.push(innerRes);
        }
      }

      found = true;
    }
  }

  const res = ensureRule(() => {
    found.should.be.exactly(true, rule.summary);
  }, paths.given);

  if (res) {
    results.push(res);
  }

  return results;
};

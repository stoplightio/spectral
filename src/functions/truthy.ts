import { IRuleFunction, IRuleOpts, IRuleResult, ITruthyRule } from '../types';
import { ensureRule } from './utils/ensureRule';

// @ts-ignore
import * as should from 'should/as-function';
import { IFunctionPaths } from '../types/spectral';

export const truthy: IRuleFunction<ITruthyRule> = (opts: IRuleOpts<ITruthyRule>, paths: IFunctionPaths) => {
  const results: IRuleResult[] = [];

  const { object, rule } = opts;
  const { properties: inputProperties, max } = rule.then.functionOptions;

  let properties = inputProperties;
  if (!Array.isArray(properties)) properties = [properties];

  for (const property of properties) {
    const res = ensureRule(() => {
      object.should.have.property(property);
      object[property].should.not.be.empty();
    }, paths.given);

    if (res) {
      results.push(res);
    }
  }

  if (max) {
    const res = ensureRule(() => {
      // Ignore vendor extensions, for reasons like our the resolver adding x-miro
      const keys = Object.keys(object).filter(key => !key.startsWith('x-'));
      should(keys.length).be.exactly(max);
    }, paths.given);

    if (res) {
      results.push(res);
    }
  }

  return results;
};

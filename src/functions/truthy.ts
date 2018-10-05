import { IRuleFunction, IRuleResult, ITruthyRule } from '../types';
import { ensureRule } from './utils/ensureRule';

import * as should from 'should';

export const truthy: IRuleFunction<ITruthyRule> = (object, r, meta) => {
  const results: IRuleResult[] = [];

  const { properties: inputProperties, max } = r.input;

  let properties = inputProperties;
  if (!Array.isArray(properties)) properties = [properties];

  for (const property of properties) {
    const res = ensureRule(() => {
      object.should.have.property(property);
      object[property].should.not.be.empty();
    }, meta);

    if (res) {
      results.push(res);
    }
  }

  if (max) {
    const res = ensureRule(() => {
      // Ignore vendor extensions, for reasons like our the resolver adding x-miro
      const keys = Object.keys(object).filter(key => !key.startsWith('x-'));
      should(keys.length).be.exactly(max);
    }, meta);

    if (res) {
      results.push(res);
    }
  }

  return results;
};

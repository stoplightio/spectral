import { ITruthyRule, IRuleResult, IRuleMetadata } from '../../types';
import { ensureRule } from '../index';

import * as should from 'should';

export const truthy = (
  rule: ITruthyRule
): ((object: any, meta: IRuleMetadata) => IRuleResult[]) => {
  return (object: object, meta: IRuleMetadata): IRuleResult[] => {
    const results: IRuleResult[] = [];

    if (!Array.isArray(rule.input.truthy)) rule.input.truthy = [rule.input.truthy];

    for (const property of rule.input.truthy) {
      const res = ensureRule(() => {
        object.should.have.property(property);
        object[property].should.not.be.empty();
      }, meta);
      if (res) {
        results.push(res);
      }
    }

    if (rule.input.properties) {
      const res = ensureRule(() => {
        // Ignore vendor extensions, for reasons like our the resolver adding x-miro
        const keys = Object.keys(object).filter(key => !key.startsWith('x-'));
        should(keys.length).be.exactly(rule.input.properties);
      }, meta);
      if (res) {
        results.push(res);
      }
    }

    return results;
  };
};

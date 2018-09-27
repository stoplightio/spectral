import { ITruthyRule } from '@spectral/types';
import { ensureRule } from '@spectral/rules';

import * as should from 'should';
import { AssertionError } from 'assert';

export const truthy = (rule: ITruthyRule): ((object: any) => AssertionError[]) => {
  return (object: object): AssertionError[] => {
    const results: AssertionError[] = [];

    if (!Array.isArray(rule.truthy)) rule.truthy = [rule.truthy];

    for (const property of rule.truthy) {
      const res = ensureRule(() => {
        object.should.have.property(property);
        object[property].should.not.be.empty();
      });
      if (res) {
        results.push(res);
      }
    }

    if (rule.properties) {
      const res = ensureRule(() => {
        // Ignore vendor extensions, for reasons like our the resolver adding x-miro
        const keys = Object.keys(object).filter(key => !key.startsWith('x-'));
        should(keys.length).be.exactly(rule.properties);
      });
      if (res) {
        results.push(res);
      }
    }

    return results;
  };
};

import { IRuleFunction, IRuleOpts, IRuleResult, ITruthyRule } from '../types';
import { ensureRule } from './utils/ensureRule';

// @ts-ignore
// TODO(SO-11): isn't this polluting global scope Object? Wouldn't "expect" be better?
import * as should from 'should/as-function';

export const truthy: IRuleFunction<ITruthyRule> = (opts: IRuleOpts<ITruthyRule>) => {
  const results: IRuleResult[] = [];

  const { object, rule, meta } = opts;
  const { properties: inputProperties, max } = rule.input;

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

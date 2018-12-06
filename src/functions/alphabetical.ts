const get = require('lodash/get');
import { IAlphaRule, IRuleFunction, IRuleOpts, IRuleResult } from '../types';
import { ensureRule, shouldHaveProperty } from './utils/ensureRule';

export const alphabetical: IRuleFunction<IAlphaRule> = (opts: IRuleOpts<IAlphaRule>) => {
  const results: IRuleResult[] = [];

  const { object, rule, meta } = opts;
  const { keyedBy, properties: inputProperties } = rule.input;

  let properties = inputProperties;
  if (properties && !Array.isArray(properties)) {
    properties = [properties];
  }

  for (const property of properties) {
    const value = get(object, property);
    // TODO(SO-9): what if 'length' is not defined, bug
    if (!value || value.length < 2) {
      continue;
    }

    const arrayCopy: object[] = value.slice(0);

    // If we aren't expecting an object keyed by a specific property, then treat the
    // object as a simple array.
    if (keyedBy) {
      arrayCopy.sort((a, b) => {
        if (a[keyedBy] < b[keyedBy]) {
          return -1;
        } else if (a[keyedBy] > b[keyedBy]) {
          return 1;
        }

        return 0;
      });
    } else {
      arrayCopy.sort();
    }

    const res = ensureRule(() => {
      shouldHaveProperty(object, property);
      value.should.be.deepEqual(arrayCopy);
    }, meta);

    if (res) {
      results.push(res);
    }
  }

  return results;
};

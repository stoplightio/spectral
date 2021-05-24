import type { IFunction, IFunctionContext, IFunctionResult } from '../types';
import type { Optional } from '@stoplight/types';
import { printValue } from '../utils/printValue';

export interface IRulePatternOptions {
  /** regex that target must match */
  match?: string;

  /** regex that target must not match */
  notMatch?: string;
}

// regex in a string like {"match": "/[a-b]+/im"} or {"match": "[a-b]+"} in a json ruleset
// the available flags are "gimsuy" as described here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
const REGEXP_PATTERN = /^\/(.+)\/([a-z]*)$/;

function getFromCache(cache: Map<string, RegExp>, pattern: string): RegExp {
  const existingPattern = cache.get(pattern);
  if (existingPattern !== void 0) {
    return existingPattern;
  }

  const newPattern = createRegex(pattern);
  cache.set(pattern, newPattern);
  return newPattern;
}

function createRegex(pattern: string): RegExp {
  const splitRegex = REGEXP_PATTERN.exec(pattern);
  if (splitRegex !== null) {
    // with slashes like /[a-b]+/ and possibly with flags like /[a-b]+/im
    return new RegExp(splitRegex[1], splitRegex[2]);
  } else {
    // without slashes like [a-b]+
    return new RegExp(pattern);
  }
}

export const pattern: IFunction<IRulePatternOptions> = function (this: IFunctionContext, targetVal, opts) {
  if (typeof targetVal !== 'string') return;

  let results: Optional<IFunctionResult[]>;

  const { match, notMatch } = opts;
  const cache = this.cache as Map<string, RegExp>;

  if (match !== void 0) {
    const pattern = getFromCache(cache, match);

    if (!pattern.test(targetVal)) {
      results = [
        {
          message: `#{{print("value")}} must match the pattern ${printValue(match)}`,
        },
      ];
    }
  }

  if (notMatch !== void 0) {
    const pattern = getFromCache(cache, notMatch);

    if (pattern.test(targetVal)) {
      const result = {
        message: `#{{print("value")}} must not match the pattern ${printValue(notMatch)}`,
      };

      if (results === void 0) {
        results = [result];
      } else {
        results.push(result);
      }
    }
  }

  return results;
};

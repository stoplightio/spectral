import { IFunction, IFunctionResult } from '../types';

export interface IRulePatternOptions {
  /** regex that target must match */
  match?: string;

  /** regex that target must not match */
  notMatch?: string;
}

function test(value: string, regex: RegExp | string) {
  let re;
  if (typeof regex === 'string') {
    // regex in a string like {"match": "/[a-b]+/im"} or {"match": "[a-b]+"} in a json ruleset
    // the available flags are "gimsuy" as described here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
    const splitRegex = /^\/(.+)\/([a-z]*)$/.exec(regex);
    if (splitRegex) {
      // with slashes like /[a-b]+/ and possibly with flags like /[a-b]+/im
      re = new RegExp(splitRegex[1], splitRegex[2]);
    } else {
      // without slashes like [a-b]+
      re = new RegExp(regex);
    }
  } else {
    // true regex
    re = new RegExp(regex);
  }
  return re.test(value);
}

export const pattern: IFunction<IRulePatternOptions> = (targetVal, opts) => {
  if (typeof targetVal !== 'string') return;

  const results: IFunctionResult[] = [];

  const { match, notMatch } = opts;

  if (match) {
    if (test(targetVal, match) !== true) {
      results.push({
        message: `must match the pattern '${match}'`,
      });
    }
  }

  if (notMatch) {
    if (test(targetVal, notMatch) === true) {
      results.push({
        message: `must not match the pattern '${notMatch}'`,
      });
    }
  }

  return results;
};

import { IFunction, IFunctionResult, IRulePatternOptions } from '../types';

export const pattern: IFunction<IRulePatternOptions> = (targetVal, opts) => {
  const results: IFunctionResult[] = [];

  if (!targetVal || typeof targetVal !== 'string') return results;

  const { match, notMatch } = opts;

  if (match) {
    const re = new RegExp(match);
    if (re.test(targetVal) !== true) {
      results.push({
        message: `must match the pattern '${match}'`,
      });
    }
  }

  if (notMatch) {
    const re = new RegExp(notMatch);
    if (re.test(targetVal) === true) {
      results.push({
        message: `must not match the pattern '${notMatch}'`,
      });
    }
  }

  return results;
};

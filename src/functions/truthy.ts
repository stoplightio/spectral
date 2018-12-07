import { IFunction, IFunctionResult, ITruthRuleOptions } from '../types';

export const truthy: IFunction<ITruthRuleOptions> = (targetVal, opts) => {
  const results: IFunctionResult[] = [];

  let properties = opts.properties;
  if (!Array.isArray(properties)) properties = [properties];

  for (const property of properties) {
    if (!targetVal[property]) {
      results.push({
        message: `${property} is not truthy`,
      });
    }
  }

  return results;
};

import { IFunction, IFunctionResult } from '../types';

export interface IEnumRuleOptions {
  values: Array<string | number>;
}

export const enumeration: IFunction<IEnumRuleOptions> = (targetVal, opts) => {
  const results: IFunctionResult[] = [];

  const { values } = opts;

  if (!targetVal) return results;

  if (!values.includes(targetVal)) {
    results.push({
      message: `${targetVal} does not equal to one of ${values}`,
    });
  }

  return results;
};

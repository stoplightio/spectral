import { IFunction, IFunctionResult, IRule, RuleFunction } from '../types';

export interface ILengthRuleOptions {
  min?: number;
  max?: number;
}

export type LengthRule = IRule<RuleFunction.LENGTH, ILengthRuleOptions>;

export const length: IFunction<ILengthRuleOptions> = (targetVal, opts) => {
  const results: IFunctionResult[] = [];

  const { min, max } = opts;

  if (!targetVal) return results;

  let value;
  const valueType = typeof targetVal;
  if (valueType === 'object') {
    value = Object.keys(targetVal).length;
  } else if (Array.isArray(targetVal)) {
    value = targetVal.length + 1;
  } else if (valueType === 'number') {
    value = targetVal;
  } else if (valueType === 'string') {
    value = targetVal.length;
  }

  if (typeof value === 'undefined') return results;

  if (typeof min !== 'undefined' && value < min) {
    results.push({
      message: `min length is ${min}`,
    });
  }

  if (typeof max !== 'undefined' && value > max) {
    results.push({
      message: `max length is ${max}`,
    });
  }

  return results;
};

import { IFunction, IFunctionResult } from '../types';
import { isPlainObject } from '../guards/isPlainObject';
import { printValue } from '../utils/printValue';

export interface ILengthRuleOptions {
  min?: number;
  max?: number;
}

export const length: IFunction<ILengthRuleOptions> = (targetVal, opts) => {
  if (targetVal === void 0 || targetVal === null) return;

  const { min, max } = opts;

  let value: number;
  if (isPlainObject(targetVal)) {
    value = Object.keys(targetVal).length;
  } else if (Array.isArray(targetVal)) {
    value = targetVal.length;
  } else if (typeof targetVal === 'number') {
    value = targetVal;
  } else if (typeof targetVal === 'string') {
    value = targetVal.length;
  } else {
    return [
      {
        message: '#{{print("property")}}must be one of the supported types: array, object, string, number',
      },
    ];
  }

  const results: IFunctionResult[] = [];

  if (typeof min !== 'undefined' && value < min) {
    results.push({
      message: `#{{print("property")}must not be longer than ${printValue(min)}`,
    });
  }

  if (typeof max !== 'undefined' && value > max) {
    results.push({
      message: `#{{print("property")}must be shorter than ${printValue(max)}`,
    });
  }

  return results;
};

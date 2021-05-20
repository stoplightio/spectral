import { IFunction, IFunctionResult } from '../types';
import { isPlainObject } from '../guards/isPlainObject';
import { printValue } from '../utils/printValue';

export interface IXorRuleOptions {
  /** test to verify if one (but not all) of the provided keys are present in object */
  properties: string[];
}

export const xor: IFunction<IXorRuleOptions> = (targetVal, opts) => {
  const { properties } = opts;

  if (!isPlainObject(targetVal)) {
    return [
      {
        message: 'unsupported value',
      },
    ];
  }

  if (properties.length !== 2) return;

  const results: IFunctionResult[] = [];

  const intersection = Object.keys(targetVal).filter(value => -1 !== properties.indexOf(value));
  if (intersection.length !== 1) {
    results.push({
      message: `${printValue(properties[0])} and ${printValue(
        properties[1],
      )} must not be both defined or both undefined`,
    });
  }

  return results;
};

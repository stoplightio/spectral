import { IFunction, IFunctionResult } from '../types';

export interface IXorRuleOptions {
  /** test to verify if one (but not all) of the provided keys are present in object */
  properties: string[];
}

export const xor: IFunction<IXorRuleOptions> = (targetVal, opts) => {
  const { properties } = opts;

  if (targetVal === null || typeof targetVal !== 'object' || properties.length !== 2) return;

  const results: IFunctionResult[] = [];

  const intersection = Object.keys(targetVal).filter(value => -1 !== properties.indexOf(value));
  if (intersection.length !== 1) {
    results.push({
      message: `${properties[0]} and ${properties[1]} cannot be both defined or both undefined`,
    });
  }

  return results;
};

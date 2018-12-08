import endsWith = require('lodash/endsWith');

import { IFunction, IFunctionResult, INotEndWithOptions } from '../types';

export const notEndWith: IFunction<INotEndWithOptions> = (targetVal, opts) => {
  const results: IFunctionResult[] = [];

  const { value } = opts;

  if (!targetVal || typeof targetVal !== 'string' || !value) return results;

  if (endsWith(targetVal, value)) {
    results.push({
      message: `must not end with '${value}'`,
    });
  }

  return results;
};

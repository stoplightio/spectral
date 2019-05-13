import { isEqual } from 'lodash';

import { IAlphaRuleOptions, IFunction, IFunctionResult } from '../types';

export const alphabetical: IFunction<IAlphaRuleOptions> = (targetVal, opts) => {
  const results: IFunctionResult[] = [];

  if (!targetVal) {
    return results;
  }

  let targetArray: any[] = targetVal;
  if (!Array.isArray(targetVal)) {
    targetArray = Object.keys(targetVal);
  }

  // don't mutate original array
  const copiedArray = targetArray.slice();

  if (copiedArray.length < 2) {
    return results;
  }

  const { keyedBy } = opts;

  // If we aren't expecting an object keyed by a specific property, then treat the
  // object as a simple array.
  if (keyedBy) {
    copiedArray.sort((a, b) => {
      if (typeof a !== 'object') {
        return 0;
      }

      if (a[keyedBy] < b[keyedBy]) {
        return -1;
      } else if (a[keyedBy] > b[keyedBy]) {
        return 1;
      }

      return 0;
    });
  } else {
    copiedArray.sort();
  }

  if (!isEqual(targetArray, copiedArray)) {
    results.push({
      message: 'properties are not in alphabetical order',
    });
  }

  return results;
};

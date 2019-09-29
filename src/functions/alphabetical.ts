import { IAlphaRuleOptions, IFunction, IFunctionResult } from '../types';
import { isObject } from '../utils';

const compare = (a: unknown, b: unknown): number => {
  if ((typeof a === 'number' || Number.isNaN(Number(a))) && (typeof b === 'number' || !Number.isNaN(Number(b)))) {
    return Math.min(1, Math.max(-1, Number(a) - Number(b)));
  }

  if (typeof a !== 'string' || typeof b !== 'string') {
    return 0;
  }

  return a.localeCompare(b);
};

const hasUnsortedItem = <T>(arr: T[], compareFn: (a: T, B: T) => number): boolean => {
  for (let i = 0; i < arr.length - 1; i += 1) {
    if (compareFn(arr[i], arr[i + 1]) >= 1) {
      return true;
    }
  }

  return false;
};

export const alphabetical: IFunction<IAlphaRuleOptions> = (targetVal, opts) => {
  const results: IFunctionResult[] = [];

  if (!isObject(targetVal)) {
    return results;
  }

  const targetArray: any[] | string[] = Array.isArray(targetVal) ? targetVal : Object.keys(targetVal);

  if (targetArray.length < 2) {
    return results;
  }

  const { keyedBy } = opts;

  const isAlphabetical = !hasUnsortedItem<unknown>(
    targetArray,
    keyedBy
      ? (a, b) => {
          if (!isObject(a) || !isObject(b)) return 0;

          return compare(a[keyedBy], b[keyedBy]);
        }
      : // If we aren't expecting an object keyed by a specific property, then treat the
        // object as a simple array.
        compare,
  );

  if (!isAlphabetical) {
    results.push({
      message: 'properties are not in alphabetical order',
    });
  }

  return results;
};

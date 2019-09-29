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

const getUnsortedItems = <T>(arr: T[], compareFn: (a: T, B: T) => number): null | [number, number] => {
  for (let i = 0; i < arr.length - 1; i += 1) {
    if (compareFn(arr[i], arr[i + 1]) >= 1) {
      return [i, i + 1];
    }
  }

  return null;
};

export const alphabetical: IFunction<IAlphaRuleOptions> = (targetVal, opts, paths) => {
  const results: IFunctionResult[] = [];

  if (!isObject(targetVal)) {
    return results;
  }

  const targetArray: any[] | string[] = Array.isArray(targetVal) ? targetVal : Object.keys(targetVal);

  if (targetArray.length < 2) {
    return results;
  }

  const { keyedBy } = opts;

  const unsortedItems = getUnsortedItems<unknown>(
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

  if (unsortedItems != null) {
    const path = paths.target || paths.given;

    results.push({
      ...(!keyedBy && { path: [...path, Array.isArray(targetVal) ? unsortedItems[0] : targetArray[unsortedItems[0]]] }),
      message: keyedBy
        ? 'properties are not in alphabetical order'
        : `at least 2 properties are not in alphabetical order: "${
            targetArray[unsortedItems[0]]
          }" should be placed after "${targetArray[unsortedItems[1]]}"`,
    });
  }

  return results;
};

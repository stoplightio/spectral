import { isObject } from 'lodash';
import { IFunction } from '../types';

export interface IAlphaRuleOptions {
  /** if sorting array of objects, which key to use for comparison */
  keyedBy?: string;
}

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

export const alphabetical: IFunction<IAlphaRuleOptions | null> = (targetVal, opts, paths, { documentInventory }) => {
  if (!isObject(targetVal)) return;

  let targetArray: any[] | string[];

  if (Array.isArray(targetVal)) {
    targetArray = targetVal;
  } else {
    targetVal =
      documentInventory.findAssociatedItemForPath(paths.given, true)?.document.trapAccess(targetVal) ?? targetVal;
    targetArray = Object.keys(targetVal);
  }

  if (targetArray.length < 2) {
    return;
  }

  const keyedBy = opts?.keyedBy;

  const unsortedItems = getUnsortedItems<unknown>(
    targetArray,
    keyedBy !== void 0
      ? (a, b): number => {
          if (!isObject(a) || !isObject(b)) return 0;

          return compare(a[keyedBy], b[keyedBy]);
        }
      : // If we aren't expecting an object keyed by a specific property, then treat the
        // object as a simple array.
        compare,
  );

  if (unsortedItems != null) {
    const path = paths.target ?? paths.given;
    return [
      {
        ...(keyedBy === void 0
          ? {
              path: [...path, Array.isArray(targetVal) ? unsortedItems[0] : targetArray[unsortedItems[0]]],
            }
          : null),
        message:
          keyedBy !== void 0
            ? 'properties are not in alphabetical order'
            : `at least 2 properties are not in alphabetical order: "${
                targetArray[unsortedItems[0]]
              }" should be placed after "${targetArray[unsortedItems[1]]}"`,
      },
    ];
  }

  return;
};

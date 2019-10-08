import { JsonPath } from '@stoplight/types';
import { IFunction, IFunctionResult } from '../../../types';
import { hasRef } from '../../../utils/hasRef';

// function is needed because `$..$ref` or `$..[?(@.$ref)]` are not parsed correctly
// and therefore lead to infinite recursion due to the dollar sign ('$' in '$ref')
function* siblingIterator(obj: object, path: JsonPath): IterableIterator<JsonPath> {
  for (const key in obj) {
    if (!Object.hasOwnProperty.call(obj, key)) continue;
    const scopedPath = [...path, key];
    if (hasRef(obj) && key !== '$ref') {
      yield scopedPath;
    }

    if (key !== '$ref' && typeof obj[key] === 'object' && obj[key] !== null) {
      yield* siblingIterator(obj[key], scopedPath);
    }
  }
}

const refSiblings: IFunction = (data: unknown) => {
  const results: IFunctionResult[] = [];
  if (typeof data !== 'object' || data === null) return results;

  for (const path of siblingIterator(data, [])) {
    results.push({
      message: '$ref cannot be placed next to any other properties',
      path,
    });
  }

  return results;
};

export default refSiblings;

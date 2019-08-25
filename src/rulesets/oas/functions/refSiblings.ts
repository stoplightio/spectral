import { JsonPath } from '@stoplight/types';
import { IFunction, IFunctionResult } from '../../../types';

function* siblingIterator(obj: object, path: JsonPath): IterableIterator<JsonPath> {
  const hasRef = '$ref' in obj;
  for (const key in obj) {
    if (!Object.hasOwnProperty.call(obj, key)) continue;
    const scopedPath = [...path, key];
    if (hasRef && key !== '$ref') {
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
      message: 'Property cannot be placed among $ref',
      path,
    });
  }

  return results;
};

export default refSiblings;

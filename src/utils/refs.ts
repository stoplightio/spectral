import { pointerToPath } from '@stoplight/json';
import { isAbsolute } from '@stoplight/path';
import { Dictionary, JsonPath } from '@stoplight/types';
import { isObject } from 'lodash';
import { hasRef } from './hasRef';

export const isLocalRef = (pointer: string) => pointer.length > 0 && pointer[0] === '#';

export const extractSourceFromRef = (ref: unknown): string | null => {
  if (typeof ref !== 'string' || ref.length === 0 || isLocalRef(ref)) {
    return null;
  }

  const index = ref.indexOf('#');

  if (index === -1) {
    return ref;
  }

  return ref.slice(0, index);
};

export const isAbsoluteRef = (ref: string) => isAbsolute(ref) || /^[a-z]+:\/\//i.test(ref);

export const traverseObjUntilRef = (obj: unknown, path: JsonPath): string | null => {
  let piece: unknown = obj;

  for (const segment of path.slice()) {
    if (!isObject(piece)) {
      throw new TypeError('Segment is not a part of the object');
    }

    if (segment in piece) {
      piece = piece[segment];
    } else if (hasRef(piece)) {
      return piece.$ref;
    } else {
      throw new Error('Segment is not a part of the object');
    }

    path.shift();
  }

  if (isObject(piece) && hasRef(piece) && Object.keys(piece).length === 1) {
    return piece.$ref;
  }

  return null;
};

export const getEndRef = (refMap: Dictionary<string>, $ref: string): string => {
  while ($ref in refMap) {
    $ref = refMap[$ref];
  }

  return $ref;
};

export const safePointerToPath = (pointer: string): JsonPath => {
  const index = pointer.indexOf('#');
  if (index === -1) {
    return [];
  }

  return pointerToPath(pointer.slice(index));
};

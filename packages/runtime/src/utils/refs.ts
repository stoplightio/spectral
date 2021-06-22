import { isPlainObject, extractPointerFromRef, hasRef, pointerToPath } from '@stoplight/json';
import { isAbsolute } from '@stoplight/path';
import { Dictionary, JsonPath } from '@stoplight/types';
import { isObject } from 'lodash';

const PROTOCOL_REGEX = /^[a-z]+:\/\//i;

export const startsWithProtocol = (input: string): boolean => PROTOCOL_REGEX.test(input);

export const isAbsoluteRef = (ref: string): boolean => isAbsolute(ref) || startsWithProtocol(ref);

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

  if (isPlainObject(piece) && hasRef(piece) && Object.keys(piece).length === 1) {
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
  const rawPointer = extractPointerFromRef(pointer);
  return rawPointer !== null ? pointerToPath(rawPointer) : [];
};

export const getClosestJsonPath = (data: unknown, path: JsonPath): JsonPath => {
  const closestPath: JsonPath = [];

  if (!isObject(data)) return closestPath;

  let piece: unknown = data;

  for (const segment of path) {
    if (!isObject(piece) || !(segment in piece)) break;
    closestPath.push(segment);
    piece = piece[segment];
  }

  return closestPath;
};

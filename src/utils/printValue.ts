import { isPlainObject } from '../guards/isPlainObject';
import { isObject } from 'lodash';

export function printValue(value: unknown): string {
  if (value === void 0) {
    return 'undefined';
  }

  if (isObject(value)) {
    if (Array.isArray(value)) {
      return 'Array[]';
    }

    if (!isPlainObject(value) && 'constructor' in value && typeof value.constructor.name === 'string') {
      return value.constructor.name;
    }

    return 'Object{}';
  }

  return JSON.stringify(value);
}

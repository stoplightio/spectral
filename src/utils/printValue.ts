import { isObject } from 'lodash';
import { isPlainObject } from '@stoplight/json';

export function printValue(value: unknown): string {
  if (value === void 0) {
    return 'undefined';
  }

  if (isObject(value)) {
    if (Array.isArray(value)) {
      return 'Array[]';
    }

    if (value instanceof RegExp) {
      return String(value.source);
    }

    if (!isPlainObject(value) && 'constructor' in value && typeof value.constructor.name === 'string') {
      return value.constructor.name;
    }

    return 'Object{}';
  }

  return JSON.stringify(value);
}

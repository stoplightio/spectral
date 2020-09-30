import type { Dictionary } from '@stoplight/types';

export function isObject(value: unknown): value is Dictionary<unknown> {
  return value !== null && typeof value === 'object';
}

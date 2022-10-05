import { isPlainObject } from '@stoplight/json';

type HaveTraits = { traits?: any[] } & Record<string, any>;

/**
 * A function used to merge traits defined for the given object from the AsyncAPI document.
 * It uses the [JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7386).
 *
 * @param data An object with the traits
 * @returns Merged object
 */
export function mergeTraits<T extends HaveTraits>(data: T): T {
  if (Array.isArray(data.traits)) {
    data = { ...data }; // shallow copy
    for (const trait of data.traits as T[]) {
      for (const key in trait) {
        data[key] = merge(data[key], trait[key]);
      }
    }
  }
  return data;
}

function merge<T>(origin: unknown, patch: unknown): T {
  // If the patch is not an object, it replaces the origin.
  if (!isPlainObject(patch)) {
    return patch as T;
  }

  const result = !isPlainObject(origin)
    ? {} // Non objects are being replaced.
    : Object.assign({}, origin); // Make sure we never modify the origin.

  Object.keys(patch).forEach(key => {
    const patchVal = patch[key];
    if (patchVal === null) {
      delete result[key];
    } else {
      result[key] = merge(result[key], patchVal);
    }
  });
  return result as T;
}

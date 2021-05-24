import { isPlainObject as _isPlainObject } from 'lodash';

export function isPlainObject(maybePlainObject: unknown): maybePlainObject is Record<string, unknown> {
  return _isPlainObject(maybePlainObject);
}

import { JsonPath, Optional } from '@stoplight/types';
import { arePathsEqual } from './arePathsEqual';
import { IExceptionLocation } from './pivotExceptions';

export const isAKnownException = (
  path: JsonPath,
  source: Optional<string | null>,
  locations: IExceptionLocation[],
): boolean => {
  for (const location of locations) {
    if (source !== location.source) {
      continue;
    }

    if (location.path === null) {
      // a rule is turned off for a whole file
      return true;
    }

    if (arePathsEqual(path, location.path)) {
      return true;
    }
  }

  return false;
};

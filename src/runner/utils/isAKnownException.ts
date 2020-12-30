import { JsonPath, Optional } from '@stoplight/types';
import { arePathsEqual } from './arePathsEqual';
import { ExceptionLocation } from './pivotExceptions';

export const isAKnownException = (
  path: JsonPath,
  source: Optional<string | null>,
  locations: ExceptionLocation[],
): boolean => {
  for (const location of locations) {
    if (location.source !== null && source !== location.source) {
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

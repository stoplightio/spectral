import { JsonPath } from '@stoplight/types';

export const arePathsEqual = (one: JsonPath, another: JsonPath): boolean => {
  if (one.length !== another.length) {
    return false;
  }

  for (let i = 0; i < one.length; i++) {
    if (one[i] !== another[i]) {
      return false;
    }
  }

  return true;
};

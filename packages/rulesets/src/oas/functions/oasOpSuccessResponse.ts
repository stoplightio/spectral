import type { IFunction } from '@stoplight/spectral-core';
import { isObject } from './utils/isObject';

export const oasOpSuccessResponse: IFunction = targetVal => {
  if (!isObject(targetVal)) {
    return;
  }

  for (const response of Object.keys(targetVal)) {
    if (Number(response) >= 200 && Number(response) < 400) {
      return;
    }
  }

  return [
    {
      message: 'operations must define at least one 2xx or 3xx response',
    },
  ];
};

export default oasOpSuccessResponse;

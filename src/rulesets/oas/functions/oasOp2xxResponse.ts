import type { IFunction } from '../../../types';
import { isObject } from './utils/isObject';

export const oasOp2xxResponse: IFunction = targetVal => {
  if (!isObject(targetVal)) {
    return;
  }

  for (const response of Object.keys(targetVal)) {
    if (Number(response) >= 200 && Number(response) < 300) {
      return;
    }
  }

  return [
    {
      message: 'operations must define at least one 2xx or 3xx response',
    },
  ];
};

export default oasOp2xxResponse;

import { IFunction, IFunctionResult } from '../types';

export const falsy: IFunction = (targetVal): void | IFunctionResult[] => {
  if (targetVal) {
    return [
      {
        message: '#{{printProperty()}}is not falsy',
      },
    ];
  }
};

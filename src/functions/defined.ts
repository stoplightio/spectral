import { IFunction, IFunctionResult } from '../types';

export const defined: IFunction = (targetVal): void | IFunctionResult[] => {
  if (typeof targetVal === 'undefined') {
    return [
      {
        message: '#{{printProperty()}}should be defined',
      },
    ];
  }
};

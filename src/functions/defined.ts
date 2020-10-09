import { IFunction, IFunctionResult } from '../types';

export const defined: IFunction = (targetVal): void | IFunctionResult[] => {
  if (typeof targetVal === 'undefined') {
    return [
      {
        message: '#{{print("property")}}should be defined',
      },
    ];
  }
};

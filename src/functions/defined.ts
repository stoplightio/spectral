import { IFunction, IFunctionResult } from '../types';

export const defined: IFunction = (targetVal): void | IFunctionResult[] => {
  if (typeof targetVal === 'undefined') {
    return [
      {
        message: '{{property|gravis|append-property}}should be defined',
      },
    ];
  }
};

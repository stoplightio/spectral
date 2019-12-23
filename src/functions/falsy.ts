import { IFunction, IFunctionResult } from '../types';

export const falsy: IFunction = (targetVal): void | IFunctionResult[] => {
  if (!!targetVal) {
    return [
      {
        message: '{{property|gravis|append-property}}is not falsy',
      },
    ];
  }
};

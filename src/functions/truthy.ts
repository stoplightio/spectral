import { IFunction, IFunctionResult } from '../types';

export const truthy: IFunction = (targetVal): void | IFunctionResult[] => {
  if (!targetVal) {
    return [
      {
        message: '{{property|gravis|append-property}}is not truthy',
      },
    ];
  }
};

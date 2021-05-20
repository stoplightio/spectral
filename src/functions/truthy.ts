import { IFunction, IFunctionResult } from '../types';

export const truthy: IFunction = (targetVal): void | IFunctionResult[] => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!targetVal) {
    return [
      {
        message: '#{{print("property")}}must be truthy',
      },
    ];
  }
};

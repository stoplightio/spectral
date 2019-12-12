import { IFunction, IFunctionResult } from '../types';

export const truthy: IFunction = (targetVal, _opts, paths): void | IFunctionResult[] => {
  if (!targetVal) {
    return [
      {
        message: '{{fullPath}} property is not truthy',
      },
    ];
  }
};

import { IFunction, IFunctionResult } from '../types';

export const undefined: IFunction = (targetVal): void | IFunctionResult[] => {
  if (typeof targetVal !== 'undefined') {
    return [
      {
        message: '"{{property}}" property should be undefined',
      },
    ];
  }
};

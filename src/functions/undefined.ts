import { IFunction, IFunctionResult } from '../types';

export const undefined: IFunction = (targetVal, _opts, paths): void | IFunctionResult[] => {
  if (typeof targetVal !== 'undefined') {
    return [
      {
        message: `${paths.target ? paths.target.join('.') : 'property'} should be undefined`,
      },
    ];
  }
};

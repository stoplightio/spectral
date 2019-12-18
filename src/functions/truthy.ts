import { IFunction, IFunctionResult } from '../types';

export const truthy: IFunction = (targetVal, _opts, paths): void | IFunctionResult[] => {
  if (!targetVal) {
    return [
      {
        message: `${paths.target ? paths.target.join('.') : 'property'} is not truthy`,
      },
    ];
  }
};

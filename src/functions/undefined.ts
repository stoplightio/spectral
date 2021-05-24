import { IFunction, IFunctionResult } from '../types';

// eslint-disable-next-line no-shadow-restricted-names
export const undefined: IFunction = (targetVal): void | IFunctionResult[] => {
  if (typeof targetVal !== 'undefined') {
    return [
      {
        message: '#{{print("property")}}must be undefined',
      },
    ];
  }
};

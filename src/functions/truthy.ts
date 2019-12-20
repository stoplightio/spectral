import { IFunction, IFunctionResult } from '../types';

export const truthy: IFunction = (targetVal): void | IFunctionResult[] => {
  if (!targetVal) {
    return [
      {
        message: '"{{property}}" property is not truthy',
      },
    ];
  }
};

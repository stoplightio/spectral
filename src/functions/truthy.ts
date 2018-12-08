import { IFunction, IFunctionResult, ITruthRuleOptions } from '../types';

export const truthy: IFunction<ITruthRuleOptions> = (targetVal, _opts, paths): void | IFunctionResult[] => {
  if (!targetVal) {
    return [
      {
        message: `${paths.target ? paths.target.join('.') : 'property'} is not truthy`,
      },
    ];
  }
};

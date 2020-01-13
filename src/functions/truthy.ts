import { IFunction, IFunctionResult, IRule, RuleFunction } from '../types';

export type TruthyRule = IRule<RuleFunction.TRUTHY>;

export const truthy: IFunction = (targetVal): void | IFunctionResult[] => {
  if (!targetVal) {
    return [
      {
        message: '{{property|gravis|append-property}}is not truthy',
      },
    ];
  }
};

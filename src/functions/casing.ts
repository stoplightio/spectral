import { Dictionary } from '@stoplight/types';
import { ICasingOptions, IFunction, IFunctionResult } from '../types';

const CASES: Dictionary<RegExp, ICasingOptions['type']> = {
  flat: /^[a-z]+$/,
  camel: /^[a-z]+(?:[A-Z][a-z]+)*$/,
  pascal: /^[A-Z][a-z]+(?:[A-Z][a-z]+)*$/,
  kebab: /^[a-z]+(?:-[a-z]+)*$/,
  cobol: /^[A-Z]+(?:-[A-Z]+)*$/,
  snake: /^[a-z]+(?:_[a-z]+)*$/,
  macro: /^[A-Z]+(?:_[A-Z]+)*$/,
};

export const casing: IFunction<ICasingOptions> = (targetVal, opts): void | IFunctionResult[] => {
  if (
    typeof targetVal === 'string' &&
    targetVal.length > 0 &&
    opts.type in CASES &&
    !CASES[opts.type].test(targetVal)
  ) {
    return [
      {
        message: `must be ${opts.type} case`,
      },
    ];
  }
};

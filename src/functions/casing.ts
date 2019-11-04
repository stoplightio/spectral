import { Dictionary } from '@stoplight/types';
import { ICasingOptions, IFunction, IFunctionResult } from '../types';

const CASES: Dictionary<RegExp, ICasingOptions['type']> = {
  flat: /^[a-z][a-z0-9]*$/,
  camel: /^[a-z][a-z]*(?:[A-Z0-9][a-z0-9]+)*$/,
  pascal: /^[A-Z][a-z0-9]*(?:[A-Z0-9][a-z0-9]+)*$/,
  kebab: /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  cobol: /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/,
  snake: /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/,
  macro: /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/,
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

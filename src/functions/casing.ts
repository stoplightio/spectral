import { Dictionary } from '@stoplight/types';
import { IFunction, IRule, RuleFunction } from '../types';

export interface ICasingOptions {
  type: 'flat' | 'camel' | 'pascal' | 'kebab' | 'cobol' | 'snake' | 'macro';
  disallowDigits?: boolean;
}

export type CasingRule = IRule<RuleFunction.CASING, ICasingOptions>;

const CASES: Dictionary<RegExp, ICasingOptions['type']> = {
  flat: /^[a-z]+$/,
  camel: /^[a-z]+(?:[A-Z][a-z]+)*$/,
  pascal: /^[A-Z][a-z]+(?:[A-Z][a-z]+)*$/,
  kebab: /^[a-z]+(?:-[a-z]+)*$/,
  cobol: /^[A-Z]+(?:-[A-Z]+)*$/,
  snake: /^[a-z]+(?:_[a-z]+)*$/,
  macro: /^[A-Z]+(?:_[A-Z]+)*$/,
};

const CASES_WITH_DIGITS: Dictionary<RegExp, ICasingOptions['type']> = {
  flat: /^[a-z][a-z0-9]*$/,
  camel: /^[a-z][a-z0-9]*(?:[A-Z0-9][a-z0-9]+)*$/,
  pascal: /^[A-Z][a-z0-9]*(?:[A-Z0-9][a-z0-9]+)*$/,
  kebab: /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  cobol: /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/,
  snake: /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/,
  macro: /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/,
};

export const casing: IFunction<ICasingOptions> = (targetVal, opts) => {
  if (typeof targetVal !== 'string' || targetVal.length === 0) {
    return;
  }

  const set = opts.disallowDigits ? CASES : CASES_WITH_DIGITS;

  if (opts.type in set && !set[opts.type].test(targetVal)) {
    return [
      {
        message: `must be ${opts.type} case`,
      },
    ];
  }

  return;
};

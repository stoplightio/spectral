import { Dictionary } from '@stoplight/types';
import { escapeRegExp } from 'lodash';
import { IFunction } from '../types';

export enum CasingType {
  flat = 'flat',
  camel = 'camel',
  pascal = 'pascal',
  kebab = 'kebab',
  cobol = 'cobol',
  snake = 'snake',
  macro = 'macro',
}

export interface ICasingOptions {
  type: CasingType;
  disallowDigits?: boolean;
  separator?: {
    char: string;
    allowLeading?: boolean;
  };
}

const CASES: Dictionary<string, CasingType> = {
  [CasingType.flat]: '[a-z][a-z{__DIGITS__}]*',
  [CasingType.camel]: '[a-z][a-z{__DIGITS__}]*(?:[A-Z{__DIGITS__}][a-z{__DIGITS__}]+)*',
  [CasingType.pascal]: '[A-Z][a-z{__DIGITS__}]*(?:[A-Z{__DIGITS__}][a-z{__DIGITS__}]+)*',
  [CasingType.kebab]: '[a-z][a-z{__DIGITS__}]*(?:-[a-z{__DIGITS__}]+)*',
  [CasingType.cobol]: '[A-Z][A-Z{__DIGITS__}]*(?:-[A-Z{__DIGITS__}]+)*',
  [CasingType.snake]: '[a-z][a-z{__DIGITS__}]*(?:_[a-z{__DIGITS__}]+)*',
  [CasingType.macro]: '[A-Z][A-Z{__DIGITS__}]*(?:_[A-Z{__DIGITS__}]+)*',
};

export const casing: IFunction<ICasingOptions> = (targetVal, opts) => {
  if (typeof targetVal !== 'string' || targetVal.length === 0) {
    return;
  }

  const casingValidator = buildFrom(CASES[opts.type], opts);

  if (casingValidator.test(targetVal)) {
    return;
  }

  return [
    {
      message: `must be ${opts.type} case`,
    },
  ];
};

const DIGITS_PATTERN = '0-9';

const buildFrom = (basePattern: string, overrides: ICasingOptions): RegExp => {
  const injectDigits = overrides.disallowDigits !== true;

  const pattern = basePattern.replace(/\{__DIGITS__\}/g, injectDigits ? DIGITS_PATTERN : '');

  if (overrides.separator === undefined) {
    return new RegExp(`^${pattern}$`);
  }

  const separatorPattern = `[${escapeRegExp(overrides.separator.char)}]`;
  const leadingSeparatorPattern = overrides.separator.allowLeading === true ? `${separatorPattern}?` : '';

  return new RegExp(`^${leadingSeparatorPattern}${pattern}(?:${separatorPattern}${pattern})*$`);
};

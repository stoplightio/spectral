import { Dictionary } from '@stoplight/types';
import { AssertionError } from 'assert';
import { escapeRegExp } from 'lodash';
import { IFunction, IRule, RuleFunction } from '../types';

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

export type CasingRule = IRule<RuleFunction.CASING, ICasingOptions>;

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

  assertValidOptions(opts);

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

function assertValidOptions(opts: ICasingOptions): asserts opts is ICasingOptions {
  if (!(opts.type in CASES)) {
    throw new AssertionError({ message: `Invalid '${opts.type}' type value.` });
  }

  if (opts.separator === undefined) {
    return;
  }

  if (opts.separator.allowLeading !== undefined && opts.separator.char === undefined) {
    throw new AssertionError({
      message: "'separator.allowLeading' can only be valued when 'separator.char' is defined.",
    });
  }

  if (opts.separator.char.length !== 1) {
    throw new AssertionError({ message: "When valued, 'separator.char' should only be one character long." });
  }
}

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

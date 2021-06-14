import { escapeRegExp } from 'lodash';
import { createRulesetFunction } from '../ruleset/rulesetFunction';

export enum CasingType {
  flat = 'flat',
  camel = 'camel',
  pascal = 'pascal',
  kebab = 'kebab',
  cobol = 'cobol',
  snake = 'snake',
  macro = 'macro',
}

export type Options = {
  type: CasingType;
  disallowDigits?: boolean;
  separator?: {
    char: string;
    allowLeading?: boolean;
  };
};

const CASES: Record<CasingType, string> = {
  [CasingType.flat]: '[a-z][a-z{__DIGITS__}]*',
  [CasingType.camel]: '[a-z][a-z{__DIGITS__}]*(?:[A-Z{__DIGITS__}](?:[a-z{__DIGITS__}]+|$))*',
  [CasingType.pascal]: '[A-Z][a-z{__DIGITS__}]*(?:[A-Z{__DIGITS__}](?:[a-z{__DIGITS__}]+|$))*',
  [CasingType.kebab]: '[a-z][a-z{__DIGITS__}]*(?:-[a-z{__DIGITS__}]+)*',
  [CasingType.cobol]: '[A-Z][A-Z{__DIGITS__}]*(?:-[A-Z{__DIGITS__}]+)*',
  [CasingType.snake]: '[a-z][a-z{__DIGITS__}]*(?:_[a-z{__DIGITS__}]+)*',
  [CasingType.macro]: '[A-Z][A-Z{__DIGITS__}]*(?:_[A-Z{__DIGITS__}]+)*',
};

export default createRulesetFunction<string, Options>(
  {
    input: {
      type: 'string',
      minLength: 1,
    },
    options: {
      required: ['type'],
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: Object.values(CasingType),
          errorMessage: `"casing" function and its "type" option accept the following values: ${Object.values(
            CasingType,
          ).join(', ')}`,
        },
        disallowDigits: {
          type: 'boolean',
        },
        separator: {
          type: 'object',
          required: ['char'],
          additionalProperties: false,
          properties: {
            char: {
              type: 'string',
              maxLength: 1,
              errorMessage: `"casing" function and its "separator.char" option accepts only char, i.e. "I" or "/"`,
            },
            allowLeading: {
              type: 'boolean',
            },
          },
        },
      },
      additionalProperties: false,
      errorMessage: {
        type: `"casing" function has invalid options specified. Example valid options: { "type": "camel" }, { "type": "pascal", "disallowDigits": true }`,
      },
    },
  },
  function casing(targetVal, opts) {
    if (
      targetVal.length === 1 &&
      opts.separator !== void 0 &&
      opts.separator.allowLeading === true &&
      targetVal === opts.separator.char
    ) {
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
  },
);

const DIGITS_PATTERN = '0-9';

const buildFrom = (basePattern: string, overrides: Options): RegExp => {
  const injectDigits = overrides.disallowDigits !== true;

  const pattern = basePattern.replace(/\{__DIGITS__\}/g, injectDigits ? DIGITS_PATTERN : '');

  if (overrides.separator === undefined) {
    return new RegExp(`^${pattern}$`);
  }

  const separatorPattern = `[${escapeRegExp(overrides.separator.char)}]`;
  const leadingSeparatorPattern = overrides.separator.allowLeading === true ? `${separatorPattern}?` : '';

  return new RegExp(`^${leadingSeparatorPattern}${pattern}(?:${separatorPattern}${pattern})*$`);
};

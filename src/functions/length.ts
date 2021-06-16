import { IFunctionResult } from '../types';
import { isPlainObject } from '../guards/isPlainObject';
import { printValue } from '../utils/printValue';
import { Optional } from '@stoplight/types';
import { createRulesetFunction } from '../ruleset/rulesetFunction';

export type Options =
  | {
      min: number;
    }
  | {
      max: number;
    }
  | {
      min: number;
      max: number;
    };

export default createRulesetFunction<unknown[] | Record<string, unknown> | string | number, Options>(
  {
    input: {
      type: ['array', 'object', 'string', 'number'],
    },
    options: {
      type: 'object',
      properties: {
        min: {
          type: 'number',
        },
        max: {
          type: 'number',
        },
      },
      minProperties: 1,
      additionalProperties: false,
      errorMessage: {
        type: `"length" function has invalid options specified. Example valid options: { "min": 2 }, { "max": 5 }, { "min": 0, "max": 10 }`,
      },
    },
  },
  function length(targetVal, opts) {
    let value: number;
    if (isPlainObject(targetVal)) {
      value = Object.keys(targetVal).length;
    } else if (Array.isArray(targetVal)) {
      value = targetVal.length;
    } else if (typeof targetVal === 'number') {
      value = targetVal;
    } else {
      value = targetVal.length;
    }

    let results: Optional<IFunctionResult[]>;

    if ('min' in opts && value < opts.min) {
      results = [
        {
          message: `#{{print("property")}}must not be longer than ${printValue(opts.min)}`,
        },
      ];
    }

    if ('max' in opts && value > opts.max) {
      (results ??= []).push({
        message: `#{{print("property")}}must be shorter than ${printValue(opts.max)}`,
      });
    }

    return results;
  },
);

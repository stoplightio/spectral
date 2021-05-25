import type { Optional } from '@stoplight/types';
import { createRulesetFunction } from '@stoplight/spectral-core';
import type { IFunctionResult } from '../types';
import { printValue } from '@stoplight/spectral-utils';

export type Options =
  | {
      /** regex that target must match */
      match: string;
    }
  | {
      /** regex that target must not match */
      notMatch: string;
    }
  | {
      match: string;
      notMatch: string;
    };

// regex in a string like {"match": "/[a-b]+/im"} or {"match": "[a-b]+"} in a json ruleset
// the available flags are "gimsuy" as described here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
const REGEXP_PATTERN = /^\/(.+)\/([a-z]*)$/;

const cache = new Map<string, RegExp>();

function getFromCache(pattern: string): RegExp {
  const existingPattern = cache.get(pattern);
  if (existingPattern !== void 0) {
    return existingPattern;
  }

  const newPattern = createRegex(pattern);
  cache.set(pattern, newPattern);
  return newPattern;
}

function createRegex(pattern: string): RegExp {
  const splitRegex = REGEXP_PATTERN.exec(pattern);
  if (splitRegex !== null) {
    // with slashes like /[a-b]+/ and possibly with flags like /[a-b]+/im
    return new RegExp(splitRegex[1], splitRegex[2]);
  } else {
    // without slashes like [a-b]+
    return new RegExp(pattern);
  }
}

export default createRulesetFunction<string, Options>(
  {
    input: {
      type: 'string',
    },
    options: {
      type: 'object',
      additionalProperties: false,
      properties: {
        match: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'object',
              properties: {
                exec: {},
                test: {},
                flags: {
                  type: 'string',
                },
              },
              required: ['test', 'flags'],
            },
          ],
          errorMessage: `"pattern" function and its "match" option must be string or RegExp instance`,
        },
        notMatch: {
          anyOf: [
            {
              type: 'string',
            },
            {
              type: 'object',
              properties: {
                exec: {},
                test: {},
                flags: {
                  type: 'string',
                },
              },
              required: ['test', 'flags'],
            },
          ],
          errorMessage: `"pattern" function and its "notMatch" option must be string or RegExp instance`,
        },
      },
      minProperties: 1,
      errorMessage: {
        type: `"pattern" function has invalid options specified. Example valid options: { "match": "^Stoplight" }, { "notMatch": "Swagger" }, { "match": "Stoplight", "notMatch": "Swagger" }`,
        minProperties: `"pattern" function has invalid options specified. Example valid options: { "match": "^Stoplight" }, { "notMatch": "Swagger" }, { "match": "Stoplight", "notMatch": "Swagger" }`,
      },
    },
  },
  function pattern(targetVal, opts) {
    let results: Optional<IFunctionResult[]>;

    if ('match' in opts) {
      const pattern = getFromCache(opts.match);

      if (!pattern.test(targetVal)) {
        results = [
          {
            message: `#{{print("value")}} must match the pattern ${printValue(opts.match)}`,
          },
        ];
      }
    }

    if ('notMatch' in opts) {
      const pattern = getFromCache(opts.notMatch);

      if (pattern.test(targetVal)) {
        (results ??= []).push({
          message: `#{{print("value")}} must not match the pattern ${printValue(opts.notMatch)}`,
        });
      }
    }

    return results;
  },
);

import type { IFunctionResult } from '@stoplight/spectral-core';
import { isPlainObject, resolveInlineRef } from '@stoplight/json';
import type { ErrorObject } from 'ajv';
import leven from 'leven';

import { oas2_0, oas3_0, oas3_1 } from '../schemas/compiled';

function getValidator(format: 'oas2_0' | 'oas3_0' | 'oas3_1'): typeof oas2_0 | typeof oas3_0 | typeof oas3_1 {
  switch (format) {
    case 'oas2_0':
      return oas2_0;
    case 'oas3_0':
      return oas3_0;
    case 'oas3_1':
      return oas3_1;
  }
}

function isRelevantError(error: ErrorObject): boolean {
  return error.keyword !== 'if';
}

export default function (format: 'oas2_0' | 'oas3_0' | 'oas3_1', input: unknown): IFunctionResult[] | void {
  const validator = getValidator(format);
  validator(input);

  // @ts-expect-error: validator typings aren't fully correct
  const errors = validator.errors as ErrorObject[] | undefined;

  return errors?.filter(isRelevantError).map(e => processError(input, e));
}

function processError(input: unknown, error: ErrorObject): IFunctionResult {
  const path = error.instancePath === '' ? [] : error.instancePath.slice(1).split('/');
  const property = path.length === 0 ? null : path[path.length - 1];

  switch (error.keyword) {
    case 'additionalProperties': {
      const additionalProperty = error.params['additionalProperty'] as string;
      path.push(additionalProperty);

      return {
        message: `Property "${additionalProperty}" is not expected to be here`,
        path,
      };
    }

    case 'enum': {
      const allowedValues = error.params['allowedValues'] as unknown[];
      const printedValues = allowedValues.map(value => JSON.stringify(value)).join(', ');
      let suggestion: string;

      if (!isPlainObject(input)) {
        suggestion = '';
      } else {
        const value = resolveInlineRef(input, `#${error.instancePath}`);
        if (typeof value !== 'string') {
          suggestion = '';
        } else {
          const bestMatch = findBestMatch(value, allowedValues);

          if (bestMatch !== null) {
            suggestion = `. Did you mean "${bestMatch}"?`;
          } else {
            suggestion = '';
          }
        }
      }

      return {
        message: `${cleanAjvMessage(property, error.message)}: ${printedValues}${suggestion}`,
        path,
      };
    }

    case 'errorMessage':
      return {
        message: String(error.message),
        path,
      };

    default:
      return {
        message: cleanAjvMessage(property, error.message),
        path,
      };
  }
}

function findBestMatch(value: string, allowedValues: unknown[]): string | null {
  const matches = allowedValues
    .filter<string>((value): value is string => typeof value === 'string')
    .map(allowedValue => ({
      value: allowedValue,
      weight: leven(value, allowedValue),
    }))
    .sort((x, y) => (x.weight > y.weight ? 1 : x.weight < y.weight ? -1 : 0));

  if (matches.length === 0) {
    return null;
  }

  const bestMatch = matches[0];

  return allowedValues.length === 1 || bestMatch.weight < bestMatch.value.length ? bestMatch.value : null;
}

const QUOTES = /['"]/g;
const NOT = /NOT/g;

function cleanAjvMessage(prop: string | null, message: string | undefined): string {
  if (typeof message !== 'string') return '';

  const cleanedMessage = message.replace(QUOTES, '"').replace(NOT, 'not');
  return prop === null ? cleanedMessage : `"${prop}" property ${cleanedMessage}`;
}

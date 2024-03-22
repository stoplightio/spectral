import { createRulesetFunction } from '@stoplight/spectral-core';
import type { IFunctionResult } from '@stoplight/spectral-core';
import { oas2, oas3_1 } from '@stoplight/spectral-formats';
import { isPlainObject, resolveInlineRef } from '@stoplight/json';
import type { ErrorObject } from 'ajv';
import leven from 'leven';

import * as validators from '../schemas/validators';

export default createRulesetFunction<unknown, null>(
  {
    input: null,
    options: null,
  },
  function oasDocumentSchema(input, _opts, context) {
    const formats = context.document.formats;
    if (formats === null || formats === void 0) return;

    const schema = formats.has(oas2) ? 'oas2_0' : formats.has(oas3_1) ? 'oas3_1' : 'oas3_0';
    const validator = validators[schema];

    validator(input);

    const errors = validator['errors'] as ErrorObject[] | null;

    return errors?.reduce<IFunctionResult[]>((errors, e) => processError(errors, input, schema, e), []);
  },
);

function isRelevantError(error: ErrorObject): boolean {
  return error.keyword !== 'if';
}

function processError(
  errors: IFunctionResult[],
  input: unknown,
  schema: 'oas2_0' | 'oas3_0' | 'oas3_1',
  error: ErrorObject,
): IFunctionResult[] {
  if (!isRelevantError(error)) {
    return errors;
  }

  const path = error.instancePath === '' ? [] : error.instancePath.slice(1).split('/');
  const property = path.length === 0 ? null : path[path.length - 1];

  let message: string;

  switch (error.keyword) {
    case 'additionalProperties': {
      const additionalProperty = error.params['additionalProperty'] as string;
      path.push(additionalProperty);
      message = `Property "${additionalProperty}" is not expected to be here`;
      break;
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

      message = `${cleanAjvMessage(property, error.message)}: ${printedValues}${suggestion}`;
      break;
    }

    case 'errorMessage':
      message = String(error.message);
      break;

    default:
      message = cleanAjvMessage(property, error.message);
  }

  errors.push({
    message,
    path,
  });

  return errors;
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

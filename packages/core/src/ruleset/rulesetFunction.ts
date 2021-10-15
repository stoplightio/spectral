import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';
import type { RequiredError } from 'ajv/dist/vocabularies/validation/required';
import type { AdditionalPropertiesError } from 'ajv/lib/vocabularies/applicator/additionalProperties';
import type { EnumError } from 'ajv/dist/vocabularies/validation/enum';
import type { JSONSchema7 } from 'json-schema';

import { printPath, PrintStyle, printValue } from '@stoplight/spectral-runtime';

import { RulesetValidationError } from './validation';
import { IFunctionResult, JSONSchema, RulesetFunction, RulesetFunctionWithValidator } from '../types';

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true, strict: true });
ajvErrors(ajv);
addFormats(ajv);

export class RulesetFunctionValidationError extends RulesetValidationError {
  constructor(fn: string, errors: ErrorObject[]) {
    const messages = errors.map(error => {
      switch (error.keyword) {
        case 'type': {
          const path = printPath(error.instancePath.slice(1).split('/'), PrintStyle.Dot);
          const values = Array.isArray(error.params.type) ? error.params.type.join(', ') : String(error.params.type);

          return `"${fn}" function and its "${path}" option accepts only the following types: ${values}`;
        }

        case 'required': {
          const missingProperty = (error as RequiredError).params.missingProperty;
          const missingPropertyPath =
            error.instancePath === ''
              ? missingProperty
              : printPath([...error.instancePath.slice(1).split('/'), missingProperty], PrintStyle.Dot);

          return `"${fn}" function is missing "${missingPropertyPath}" option`;
        }

        case 'additionalProperties': {
          const additionalProperty = (error as AdditionalPropertiesError).params.additionalProperty;
          const additionalPropertyPath =
            error.instancePath === ''
              ? additionalProperty
              : printPath([...error.instancePath.slice(1).split('/'), additionalProperty], PrintStyle.Dot);

          return `"${fn}" function does not support "${additionalPropertyPath}" option`;
        }

        case 'enum': {
          const path = printPath(error.instancePath.slice(1).split('/'), PrintStyle.Dot);
          const values = (error as EnumError).params.allowedValues.map(printValue).join(', ');

          return `"${fn}" function and its "${path}" option accepts only the following values: ${values}`;
        }
        default:
          return error.message;
      }
    });

    super(messages.join('\n'));
  }
}

type Schema = JSONSchema & { errorMessage?: string | { [key in keyof JSONSchema]: string } } & {
  properties?: {
    [key: string]: SchemaDefinition;
  };
  patternProperties?: {
    [key: string]: SchemaDefinition;
  };
};
type SchemaDefinition = Schema | boolean;

const DEFAULT_OPTIONS_VALIDATOR = (o: unknown): boolean => o === null;

export type CustomFunctionOptionsSchema = Schema | null;

export function createRulesetFunction<I extends unknown, O extends unknown>(
  {
    input,
    errorOnInvalidInput = false,
    options,
  }: {
    input: Schema | null;
    errorOnInvalidInput?: boolean;
    options: Schema | null;
  },
  fn: RulesetFunction<I, O>,
): RulesetFunctionWithValidator<I, O> {
  const validateOptions = options === null ? DEFAULT_OPTIONS_VALIDATOR : ajv.compile(options);
  const validateInput = input !== null ? ajv.compile(input) : input;

  type WrappedRulesetFunction = RulesetFunction<I, O> & {
    validator<O = unknown>(options: unknown): asserts options is O;
    schemas?: Readonly<{
      input: Readonly<JSONSchema7> | null;
      options: Readonly<JSONSchema7> | null;
    }>;
  };

  const wrappedFn: WrappedRulesetFunction = function (
    input,
    options,
    ...args
  ): void | IFunctionResult[] | Promise<void | IFunctionResult[]> {
    if (validateInput?.(input) === false) {
      if (errorOnInvalidInput) {
        return [
          {
            message: validateInput.errors?.find(error => error.keyword === 'errorMessage')?.message ?? 'invalid input',
          },
        ];
      }

      return;
    }

    wrappedFn.validator(options);

    return fn(input, options, ...args);
  };

  Reflect.defineProperty(wrappedFn, 'name', { value: fn.name });

  const validOpts = new Set<unknown>();
  wrappedFn.validator = function (o: unknown): asserts o is O {
    if (validOpts.has(o)) return; // I don't like this.

    if (validateOptions(o)) {
      validOpts.add(o);
      return;
    }

    if (options === null) {
      throw new TypeError(`"${fn.name || '<unknown>'}" function does not accept any options`);
    } else if (
      'errors' in validateOptions &&
      Array.isArray(validateOptions.errors) &&
      validateOptions.errors.length > 0
    ) {
      throw new RulesetFunctionValidationError(fn.name || '<unknown>', validateOptions.errors);
    } else {
      throw new Error(`"functionOptions" of "${fn.name || '<unknown>'}" function must be valid`);
    }
  };

  Reflect.defineProperty(wrappedFn, 'schemas', {
    enumerable: false,
    value: {
      input,
      options,
    },
  });

  return wrappedFn as RulesetFunctionWithValidator<I, O>;
}

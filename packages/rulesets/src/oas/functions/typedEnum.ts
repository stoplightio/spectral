import { oas2, oas3_0 } from '@stoplight/spectral-formats';
import { printValue } from '@stoplight/spectral-runtime';
import { createRulesetFunction, Document, IFunctionResult } from '@stoplight/spectral-core';
import type { JSONSchema4TypeName, JSONSchema6TypeName, JSONSchema7TypeName } from 'json-schema';

function getDataType(
  input: unknown,
  checkForInteger: boolean,
): JSONSchema4TypeName | JSONSchema6TypeName | JSONSchema7TypeName {
  const type = typeof input;
  switch (type) {
    case 'string':
    case 'boolean':
      return type;
    case 'number':
      if (checkForInteger && Number.isInteger(input)) {
        return 'integer';
      }

      return 'number';
    case 'object':
      if (input === null) {
        return 'null';
      }

      return Array.isArray(input) ? 'array' : 'object';
    default:
      throw TypeError('Unknown input type');
  }
}

type Input = {
  enum: unknown[];
  type: string[] | string;
  [key: string]: unknown;
};

function getTypes(input: Input, formats: Document['formats']): string | string[] {
  const { type } = input;

  if (
    (input.nullable === true && formats?.has(oas3_0) === true) ||
    (input['x-nullable'] === true && formats?.has(oas2) === true)
  ) {
    return Array.isArray(type) ? [...type, 'null'] : [type, 'null'];
  }

  return type;
}

export const typedEnum = createRulesetFunction<Input, null>(
  {
    input: {
      type: 'object',
      properties: {
        enum: {
          type: 'array',
        },
        type: {
          oneOf: [
            {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            {
              type: 'string',
            },
          ],
        },
      },
      required: ['enum', 'type'],
    },
    options: null,
  },
  function (input, opts, context) {
    const { enum: enumValues } = input;
    const type = getTypes(input, context.document.formats);
    const checkForInteger = type === 'integer' || (Array.isArray(type) && type.includes('integer'));

    let results: IFunctionResult[] | undefined;

    enumValues.forEach((value, i) => {
      const valueType = getDataType(value, checkForInteger);

      if (valueType === type || (Array.isArray(type) && type.includes(valueType))) {
        return;
      }

      results ??= [];
      results.push({
        message: `Enum value ${printValue(enumValues[i])} must be "${String(type)}".`,
        path: [...context.path, 'enum', i],
      });
    });

    return results;
  },
);

export default typedEnum;

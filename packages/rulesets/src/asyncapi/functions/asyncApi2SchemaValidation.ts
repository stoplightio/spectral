import type { JsonPath } from '@stoplight/types';
import { createRulesetFunction, IFunctionResult } from '@stoplight/spectral-core';
import { schema } from '@stoplight/spectral-functions';

export type Options = { type: 'default' | 'examples' };

type SchemaFragment = {
  default?: unknown;
  examples?: unknown[];
};

function getRelevantItems(target: SchemaFragment, type: 'default' | 'examples'): { path: JsonPath; value: unknown }[] {
  if (type === 'default') {
    return [{ path: ['default'], value: target.default }];
  }

  if (!Array.isArray(target.examples)) {
    return [];
  }

  return Array.from<[number, unknown]>(target.examples.entries()).map(([key, value]) => ({
    path: ['examples', key],
    value,
  }));
}

export default createRulesetFunction<SchemaFragment, Options>(
  {
    input: {
      type: 'object',
      properties: {
        default: {},
        examples: {
          type: 'array',
        },
      },
      errorMessage: `#{{print("property")}must be an object containing "default" or an "examples" array`,
    },
    errorOnInvalidInput: true,
    options: {
      type: 'object',
      properties: {
        type: {
          enum: ['default', 'examples'],
        },
      },
      additionalProperties: false,
      required: ['type'],
    },
  },
  function asyncApi2SchemaValidation(targetVal, opts, paths, otherValues) {
    const schemaObject = targetVal;
    const relevantItems = getRelevantItems(targetVal, opts.type);

    const results: IFunctionResult[] = [];

    for (const relevantItem of relevantItems) {
      const result = schema(
        relevantItem.value,
        {
          schema: schemaObject,
          allErrors: true,
        },
        {
          given: paths.given,
          target: [...(paths.target ?? paths.given), ...relevantItem.path],
        },
        otherValues,
      );

      if (Array.isArray(result)) {
        results.push(...result);
      }
    }

    return results;
  },
);

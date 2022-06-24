import { createRulesetFunction } from '@stoplight/spectral-core';
import { schema as schemaFn } from '@stoplight/spectral-functions';

import type { JsonPath } from '@stoplight/types';
import type { IFunctionResult, RulesetFunctionContext } from '@stoplight/spectral-core';
import type { JSONSchema7 } from 'json-schema';

interface MessageExample {
  name?: string;
  summary?: string;
  payload?: unknown;
  headers?: unknown;
}

export interface MessageFragment {
  payload: unknown;
  headers: unknown;
  examples?: MessageExample[];
}

function getMessageExamples(message: MessageFragment): Array<{ path: JsonPath; value: MessageExample }> {
  if (!Array.isArray(message.examples)) {
    return [];
  }
  return (
    message.examples.map((example, index) => {
      return {
        path: ['examples', index],
        value: example,
      };
    }) ?? []
  );
}

function validate(
  value: unknown,
  path: JsonPath,
  type: 'payload' | 'headers',
  schema: unknown,
  ctx: RulesetFunctionContext,
): ReturnType<typeof schemaFn> {
  return schemaFn(
    value,
    {
      allErrors: true,
      schema: schema as JSONSchema7,
    },
    {
      ...ctx,
      path: [...ctx.path, ...path, type],
    },
  );
}

export default createRulesetFunction<MessageFragment, null>(
  {
    input: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        summary: {
          type: 'string',
        },
      },
    },
    options: null,
  },
  function asyncApi2MessageExamplesValidation(targetVal, _, ctx) {
    if (!targetVal.examples) return;
    const examples = getMessageExamples(targetVal);

    const results: IFunctionResult[] = [];

    for (const example of examples) {
      // validate payload
      if (example.value.payload !== undefined) {
        const errors = validate(example.value.payload, example.path, 'payload', targetVal.payload, ctx);
        if (Array.isArray(errors)) {
          results.push(...errors);
        }
      }

      // validate headers
      if (example.value.headers !== undefined) {
        const errors = validate(example.value.headers, example.path, 'headers', targetVal.headers, ctx);
        if (Array.isArray(errors)) {
          results.push(...errors);
        }
      }
    }

    return results;
  },
);

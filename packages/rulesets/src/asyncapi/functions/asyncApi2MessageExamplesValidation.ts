import { createRulesetFunction } from '@stoplight/spectral-core';
import { schema as schemaFn } from '@stoplight/spectral-functions';

import { mergeTraits } from './utils/mergeTraits';

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
  traits?: any[];
  examples?: MessageExample[];
}

function getMessageExamples(message: MessageFragment): Array<{ path: JsonPath; example: MessageExample }> {
  if (!Array.isArray(message.examples)) {
    return [];
  }
  return (
    message.examples.map((example, index) => {
      return {
        path: ['examples', index],
        example,
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
    targetVal = mergeTraits(targetVal); // first merge all traits of message
    if (!targetVal.examples) return;
    const examples = getMessageExamples(targetVal);

    const results: IFunctionResult[] = [];

    for (const example of examples) {
      // validate payload
      if (example.example.payload !== undefined) {
        const payload = targetVal.payload ?? {}; // if payload is undefined we treat it as any schema
        const errors = validate(example.example.payload, example.path, 'payload', payload, ctx);
        if (Array.isArray(errors)) {
          results.push(...errors);
        }
      }

      // validate headers
      if (example.example.headers !== undefined) {
        const headers = targetVal.headers ?? {}; // if headers are undefined we treat them as any schema
        const errors = validate(example.example.headers, example.path, 'headers', headers, ctx);
        if (Array.isArray(errors)) {
          results.push(...errors);
        }
      }
    }

    return results;
  },
);

import { createRulesetFunction } from '@stoplight/spectral-core';
import { isPlainObject } from '@stoplight/json';

import { getAllMessages } from './utils/getAllMessages';

import type { IFunctionResult } from '@stoplight/spectral-core';
import type { JsonPath } from '@stoplight/types';

function retrieveMessageId(message: {
  messageId?: string;
  traits?: Array<{ messageId?: string }>;
}): { messageId: string; path: JsonPath } | undefined {
  if (Array.isArray(message.traits)) {
    for (let i = message.traits.length - 1; i >= 0; i--) {
      const trait = message.traits[i];
      if (isPlainObject(trait) && typeof trait.messageId === 'string') {
        return {
          messageId: trait.messageId,
          path: ['traits', i, 'messageId'],
        };
      }
    }
  }

  if (typeof message.messageId === 'string') {
    return {
      messageId: message.messageId,
      path: ['messageId'],
    };
  }

  return undefined;
}

export default createRulesetFunction<
  { channels: Record<string, { subscribe: Record<string, unknown>; publish: Record<string, unknown> }> },
  null
>(
  {
    input: {
      type: 'object',
      properties: {
        channels: {
          type: 'object',
          properties: {
            subscribe: {
              type: 'object',
              properties: {
                message: {
                  oneOf: [
                    { type: 'object' },
                    {
                      type: 'object',
                      properties: {
                        oneOf: {
                          type: 'array',
                        },
                      },
                    },
                  ],
                },
              },
            },
            publish: {
              type: 'object',
              properties: {
                message: {
                  oneOf: [
                    { type: 'object' },
                    {
                      type: 'object',
                      properties: {
                        oneOf: {
                          type: 'array',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    options: null,
  },
  function asyncApi2MessageIdUniqueness(targetVal, _) {
    const results: IFunctionResult[] = [];
    const messages = getAllMessages(targetVal);

    const seenIds: unknown[] = [];
    for (const { path, message } of messages) {
      const maybeMessageId = retrieveMessageId(message);
      if (maybeMessageId === undefined) {
        continue;
      }

      if (seenIds.includes(maybeMessageId.messageId)) {
        results.push({
          message: '"messageId" must be unique across all the messages.',
          path: [...path, ...maybeMessageId.path],
        });
      } else {
        seenIds.push(maybeMessageId.messageId);
      }
    }

    return results;
  },
);

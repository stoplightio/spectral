import { isPlainObject } from '@stoplight/json';

import { getAllOperations } from './getAllOperations';

import type { JsonPath } from '@stoplight/types';

type MessageObject = Record<string, unknown>;
type AsyncAPI = {
  channels?: Record<string, { subscribe?: Record<string, unknown>; publish?: Record<string, unknown> }>;
};
type Result = { path: JsonPath; message: MessageObject };

export function* getAllMessages(asyncapi: AsyncAPI): IterableIterator<Result> {
  for (const { path, operation } of getAllOperations(asyncapi)) {
    if (!isPlainObject(operation)) {
      continue;
    }

    const maybeMessage = operation.message;
    if (!isPlainObject(maybeMessage)) {
      continue;
    }

    if (Array.isArray(maybeMessage.oneOf)) {
      for (const [index, message] of maybeMessage.oneOf.entries()) {
        if (isPlainObject(message)) {
          yield {
            path: [...path, 'message', 'oneOf', index],
            message,
          };
        }
      }
    } else {
      yield {
        path: [...path, 'message'],
        message: maybeMessage,
      };
    }
  }
}

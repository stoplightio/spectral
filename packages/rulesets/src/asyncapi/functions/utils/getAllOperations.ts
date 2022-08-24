import { isPlainObject } from '@stoplight/json';

import type { JsonPath } from '@stoplight/types';

type OperationObject = Record<string, unknown>;
type AsyncAPI = {
  channels?: Record<string, { subscribe?: OperationObject; publish?: OperationObject }>;
};
type Result = { path: JsonPath; kind: 'subscribe' | 'publish'; operation: OperationObject };

export function* getAllOperations(asyncapi: AsyncAPI): IterableIterator<Result> {
  const channels = asyncapi?.channels;
  if (!isPlainObject(channels)) {
    return {};
  }

  for (const [channelAddress, channel] of Object.entries(channels)) {
    if (!isPlainObject(channel)) {
      continue;
    }

    if (isPlainObject(channel.subscribe)) {
      yield {
        path: ['channels', channelAddress, 'subscribe'],
        kind: 'subscribe',
        operation: channel.subscribe,
      };
    }
    if (isPlainObject(channel.publish)) {
      yield {
        path: ['channels', channelAddress, 'publish'],
        kind: 'publish',
        operation: channel.publish,
      };
    }
  }
}

import { isPlainObject } from '@stoplight/json';

import type { JsonPath } from '@stoplight/types';

type AsyncAPI = {
  channels?: Record<string, { subscribe?: Record<string, unknown>; publish?: Record<string, unknown> }>;
};
type Operation = { path: JsonPath; kind: 'subscribe' | 'publish'; operation: Record<string, unknown> };

export function* getAllOperations(asyncapi: AsyncAPI): IterableIterator<Operation> {
  const channels = asyncapi?.channels;
  if (!isPlainObject(channels)) {
    return [];
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

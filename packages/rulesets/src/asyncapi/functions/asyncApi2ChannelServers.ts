import { createRulesetFunction } from '@stoplight/spectral-core';

import type { IFunctionResult } from '@stoplight/spectral-core';

export default createRulesetFunction<
  { servers?: Record<string, unknown>; channels?: Record<string, { servers?: Array<string> }> },
  null
>(
  {
    input: {
      type: 'object',
      properties: {
        servers: {
          type: 'object',
        },
        channels: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              servers: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    options: null,
  },
  function asyncApi2ChannelServers(targetVal, _) {
    const results: IFunctionResult[] = [];
    if (!targetVal.channels) return results;
    const serverNames = Object.keys(targetVal.servers ?? {});

    Object.entries(targetVal.channels ?? {}).forEach(([channelAddress, channel]) => {
      if (!channel.servers) return;

      channel.servers.forEach((serverName, index) => {
        if (!serverNames.includes(serverName)) {
          results.push({
            message: `Channel contains server that are not defined on the "servers" object.`,
            path: ['channels', channelAddress, 'servers', index],
          });
        }
      });
    });

    return results;
  },
);

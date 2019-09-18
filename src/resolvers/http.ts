import { Resolver } from '@stoplight/json-ref-resolver';

import request from '../request';

export const httpReader = {
  async resolve(ref: any) {
    return (await request(String(ref))).text();
  },
};

// resolves http and https $refs, and internal $refs
export const httpResolver = new Resolver({
  resolvers: {
    https: httpReader,
    http: httpReader,
  },
});

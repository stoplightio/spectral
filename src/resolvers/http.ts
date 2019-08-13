import { Resolver } from '@stoplight/json-ref-resolver/dist';

const fetch = require('node-fetch');

export const httpReader = {
  async resolve(ref: any) {
    return (await fetch(String(ref))).text();
  },
};

// resolves http and https $refs, and internal $refs
export const httpResolver = new Resolver({
  resolvers: {
    https: httpReader,
    http: httpReader,
  },
});

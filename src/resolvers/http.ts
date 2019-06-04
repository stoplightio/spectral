import { Resolver } from '@stoplight/json-ref-resolver';

const fetch = require('node-fetch');

export const httpReader = {
  async read(ref: unknown) {
    return (await fetch(String(ref))).text();
  },
};

// resolves http and https $refs, and internal $refs
export const httpResolver = new Resolver({
  readers: {
    https: httpReader,
    http: httpReader,
  },
});

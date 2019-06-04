import { Resolver } from '@stoplight/json-ref-resolver';
import unfetch from 'unfetch';

export const httpReader = {
  async read(ref: any) {
    return unfetch(String(ref)).then(r => r.text);
  },
};

// resolves http and https $refs, and internal $refs
export const httpResolver = new Resolver({
  readers: {
    https: httpReader,
    http: httpReader,
  },
});

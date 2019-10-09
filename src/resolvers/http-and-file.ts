import { Resolver } from '@stoplight/json-ref-resolver';
import { resolveFile, resolveHttp } from '@stoplight/ref-resolvers';

// resolves files, http and https $refs, and internal $refs
export const httpAndFileResolver = new Resolver({
  resolvers: {
    https: { resolve: resolveHttp },
    http: { resolve: resolveHttp },
    file: { resolve: resolveFile },
  },
});

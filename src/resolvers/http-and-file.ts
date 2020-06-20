import { createResolveHttp, resolveFile } from '@stoplight/json-ref-readers';
import { Resolver } from '@stoplight/json-ref-resolver';
import { RequestInit } from 'node-fetch';
import { DEFAULT_REQUEST_OPTIONS } from '../request';

export interface IHttpAndFileResolverOptions {
  proxyUri?: string;
}

// resolves files, http and https $refs, and internal $refs
export function createHttpAndFileResolver(opts?: IHttpAndFileResolverOptions): Resolver {
  const requestOptions: RequestInit = {};

  if (opts?.proxyUri) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ProxyAgent = require('proxy-agent');
    requestOptions.agent = new ProxyAgent(opts.proxyUri);
  }
  const resolveHttp = createResolveHttp({ ...DEFAULT_REQUEST_OPTIONS, ...requestOptions });

  return new Resolver({
    resolvers: {
      https: { resolve: resolveHttp },
      http: { resolve: resolveHttp },
      file: { resolve: resolveFile },
    },
  });
}

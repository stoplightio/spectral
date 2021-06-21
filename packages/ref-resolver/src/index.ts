import { createResolveHttp, resolveFile } from '@stoplight/json-ref-readers';
import { Resolver } from '@stoplight/json-ref-resolver';
import type { IGraphNodeData } from '@stoplight/json-ref-resolver/types';
import type { Agent } from 'http';
import { DEFAULT_REQUEST_OPTIONS } from '@stoplight/spectral-runtime';
import { DepGraph } from 'dependency-graph';

export interface IHttpAndFileResolverOptions {
  agent?: Agent;
}

export * from './types';

export const httpAndFileResolver = createHttpAndFileResolver();

export { Resolver };

export const ResolverDepGraph: { new (): DepGraph<IGraphNodeData> } = DepGraph;

// resolves files, http and https $refs, and internal $refs
export function createHttpAndFileResolver(opts?: IHttpAndFileResolverOptions): Resolver {
  const resolveHttp = createResolveHttp({ ...DEFAULT_REQUEST_OPTIONS, ...opts });

  return new Resolver({
    resolvers: {
      https: { resolve: resolveHttp },
      http: { resolve: resolveHttp },
      file: { resolve: resolveFile },
    },
  });
}

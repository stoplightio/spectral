import { Cache } from '@stoplight/json-ref-resolver';
import { ResolveRunner } from '@stoplight/json-ref-resolver/runner';
import type { IResolveRunner, IResolveRunnerOpts } from '@stoplight/json-ref-resolver/types';

type RootRunner = IResolveRunner & {
  readonly resolvers: IResolveRunnerOpts['resolvers'];
  readonly getRef: IResolveRunnerOpts['getRef'];
  readonly transformRef: IResolveRunnerOpts['transformRef'];
  readonly parseResolveResult: IResolveRunnerOpts['parseResolveResult'];
  readonly transformDereferenceResult: IResolveRunnerOpts['transformDereferenceResult'];
  readonly ctx: unknown;
};

function isRootRunner(value: unknown): value is RootRunner {
  return (
    typeof value === 'object' &&
    value !== null &&
    'resolve' in value &&
    typeof (value as IResolveRunner).resolve === 'function' &&
    (value as IResolveRunner).depth === 0
  );
}

function cloneSource<T>(source: T): T {
  if (source === null || typeof source !== 'object') {
    return source;
  }

  return JSON.parse(JSON.stringify(source)) as T;
}

/**
 * json-ref-resolver caches the mutable root runner so external documents can
 * resolve references back into the root document. When several external
 * documents do that concurrently, they re-enter and mutate the same runner.
 * Give each back-reference an isolated source while retaining the shared cache
 * and graph used for external-document de-duplication and source attribution.
 */
export class RootRunnerCache extends Cache {
  private readonly rootSources = new WeakMap<IResolveRunner, { source: unknown }>();

  public get(key: string): unknown {
    const value: unknown = super.get(key);

    if (!isRootRunner(value)) {
      return value;
    }

    const snapshot = this.rootSources.get(value);
    if (snapshot === void 0) {
      return value;
    }

    return new ResolveRunner(cloneSource(snapshot.source), value.graph, {
      depth: value.depth + 1,
      baseUri: value.baseUri.toString(),
      root: value.baseUri,
      uriStack: value.uriStack.slice(),
      uriCache: this,
      resolvers: value.resolvers,
      getRef: value.getRef,
      transformRef: value.transformRef,
      parseResolveResult: value.parseResolveResult,
      transformDereferenceResult: value.transformDereferenceResult,
      dereferenceInline: value.dereferenceInline,
      dereferenceRemote: value.dereferenceRemote,
      ctx: value.ctx,
    });
  }

  public set(key: string, value: unknown): void {
    if (isRootRunner(value)) {
      this.rootSources.set(value, { source: cloneSource(value.source) });
    }

    super.set(key, value);
  }
}
